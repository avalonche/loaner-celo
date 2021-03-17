// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

import {ILendingPoolAddressesProvider} from "../interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "../interfaces/ILendingPool.sol";
import {IAToken} from "../interfaces/IAToken.sol";
import {ILoanToken} from "../interfaces/ILoanToken.sol";
import {ICommunity} from "../interfaces/ICommunity.sol";

contract LoanerPool is ERC20, ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    
    ILoanToken[] _loans;

    ICommunity public community;
    ILendingPoolAddressesProvider public moolaAddressesProvider;
    IERC20 public stablecoin;

    // fund manager, usually the community manager
    address public fundsManager;
    // loaner address 
    address public loanerAddress;
    // controlling deposits to pool
    bool public isJoiningPaused;

    mapping(address => uint256) latestJoinBlock;

    // cache values during sync for gas optimization
    bool private inSync;
    uint256 private loansValueCache;

    // // ===== Pool parameters =====

    // // bound APY
    // uint256 public minApy;
    // uint256 public maxApy;

    // // bound on min & max loan sizes
    // uint256 public minSize;
    // uint256 public maxSize;

    // size of approval stake in for the loan
    uint256 public participationSize;

    // amount of participation from community managers
    uint256 public participationRate;

    // ratio of approve and reject from community managers
    uint256 public approvalRate;

    // // bound in min & max loan terms
    // uint256 public minTerm;
    // uint256 public maxTerm;

    // // maximum amount of loans lender can handle at once
    // uint256 public maxLoans;

    // ==== Events ====

    /**
     * @dev Emitted when someone joins the pool
     * @param staker Account staking
     * @param deposited Amount deposited
     * @param minted Amount of pool tokens minted
     */
    event Joined(address indexed staker, uint256 deposited, uint256 minted);

    /**
     * @dev Emitted when someone exits the pool
     * @param staker Account exiting
     * @param amount Amount unstaking
     */
    event Exited(address indexed staker, uint256 amount);

    /**
     * @dev Emitted when funds are flushed into moola markets
     * @param currencyAmount Amount of tokens deposited
     */
    event Flushed(uint256 currencyAmount);


    /**
     * @dev Emitted when funds are pulled from moola markets
     * @param aAmount Amount of atokens
     */
    event Pulled(uint256 aAmount);

    /**
     * @dev Emitted when joining is paused or unpaused
     * @param isJoiningPaused New pausing status
     */
    event JoiningPauseStatusChanged(bool isJoiningPaused);

    /**
     * @dev Emitted when funds manager is changed
     * @param newManager New manager address
     */
    event FundsManagerChanged(address newManager);

    // /**
    //  * @dev Emitted when APY bounds have changed
    //  * @param minApy New minimum APY
    //  * @param maxApy New maximum APY
    //  */
    // event ApyLimitsChanged(uint256 minApy, uint256 maxApy);

    /**
     * @dev Emitted when participation size changed
     * @param participationSize New participation size
     */
    event ParticipationSizeChanged(uint256 participationSize);

    // /**
    //  * @dev Emitted when the loan size bounds are changed
    //  * @param minSize New minimum loan size
    //  * @param maxSize New maximum loan size
    //  */
    // event SizeLimitsChanged(uint256 minSize, uint256 maxSize);

    // /**
    //  * @dev Emitted when loan term bounds are changed
    //  * @param minTerm New minimum loan term
    //  * @param maxTerm New minimum loan term
    //  */
    // event TermLimitsChanged(uint256 minTerm, uint256 maxTerm);

    // /**
    //  * @dev Emitted when loans limit is changed
    //  * @param maxLoans new maximum amount of loans
    //  */
    // event LoansLimitChanged(uint256 maxLoans);

    /**
     * @dev Emitted when a loan is funded
     * @param loanToken LoanToken contract which was funded
     * @param amount Amount funded
     */
    event Funded(address indexed loanToken, uint256 amount);

    /**
     * @dev Emitted when funds are reclaimed from the LoanToken contract
     * @param loanToken LoanToken from which funds were reclaimed
     * @param amount Amount repaid
     */
    event Reclaimed(address indexed loanToken, uint256 amount);

    /**
     * @dev Emitted when community contract is changed
     * @param newCommunity Address of new community pool is assigned to
     */
    event CommunityChanged(address newCommunity);

    /**
     * @dev pool can only be joined when it's unpaused
     */
    modifier joiningNotPaused() {
        require(!isJoiningPaused, "LoanerPool: Joining the pool is paused");
        _;
    }

    /**
     * @dev only lender can perform borrowing or repaying
     */
    modifier onlyOwnerOrManager() {
        require(msg.sender == owner() || msg.sender == fundsManager, "LoanerPool: Caller is neither owner nor funds manager");
        _;
    }

    /**
     * @dev only loaner contract can set fund manager and pool parameters
     */
    modifier onlyLoaner() {
        require(msg.sender == loanerAddress, "LoanerPool: Caller is not Loaner contract");
        _;
    }

    /**
     * Sync values to avoid making expensive calls multiple times
     * Will set inSync to true, allowing getter functions to return cached values
     * Wipes cached values to save gas
     */
    modifier sync() {
        // sync
        loansValueCache = totalLoansValue();
        inSync = true;
        _;
        // wipe
        inSync = false;
        loansValueCache = 0;
    }

    constructor(
        address _moolaAddressesProviderAddress,
        address _stablecoinAddress,
        address _community,
        address _fundsManager,
        address _loanerAddress
    ) public ERC20("Loaner LP", "MKO-LP") {
        moolaAddressesProvider = ILendingPoolAddressesProvider(_moolaAddressesProviderAddress);
        stablecoin = IERC20(_stablecoinAddress);
        community = ICommunity(_community);
        loanerAddress = _loanerAddress;
        fundsManager = _fundsManager;
        FundsManagerChanged(_fundsManager);


        // minApy = 1000;
        // maxApy = 3000;
        participationSize = 1000;
        approvalRate = 8000;
        participationRate = 8000;
        // minSize = 1000 ether;
        // maxSize = 10000000 ether;
        // minTerm = 182 days;
        // maxTerm = 3650 days;

        // maxLoans = 100;
    }

    /**
     * @dev get currency token
     * @return currency token
     */
    function currencyToken() public view returns (IERC20) {
        return stablecoin;
    }

    // /**
    //  * @dev Set new bounds on loan size. Only owner can change parameters.
    //  * @param min New minimum loan size
    //  * @param max New maximum loan size
    //  */
    // function setSizeLimits(uint256 min, uint256 max) external onlyOwnerOrManager {
    //     require(min > 0, "LoanerPool: Minimal loan size cannot be 0");
    //     require(max >= min, "LoanerPool: Maximal loan size is smaller than minimal");
    //     minSize = min;
    //     maxSize = max;
    //     emit SizeLimitsChanged(min, max);
    // }

    // /**
    //  * @dev Set new bounds on loan term length. Only owner can change parameters.
    //  * @param min New minimum loan term
    //  * @param max New maximum loan term
    //  */
    // function setTermLimits(uint256 min, uint256 max) external onlyOwnerOrManager {
    //     require(max >= min, "LoanerPool: Maximal loan term is smaller than minimal");
    //     minTerm = min;
    //     maxTerm = max;
    //     emit TermLimitsChanged(min, max);
    // }

    // /**
    //  * @dev Set new bounds on loan APY. Only owner can change parameters.
    //  * @param newMinApy New minimum loan APY
    //  * @param newMaxApy New maximum loan APY
    //  */
    // function setApyLimits(uint256 newMinApy, uint256 newMaxApy) external onlyOwnerOrManager {
    //     require(newMaxApy >= newMinApy, "LoanerPool: Maximal APY is smaller than minimal");
    //     minApy = newMinApy;
    //     maxApy = newMaxApy;
    //     emit ApyLimitsChanged(newMinApy, newMaxApy);
    // }

    /**
     * @dev Set new participation size. Only owner can change parameters.
     * @param newParticipationSize New participation size.
     */
    function setParticipationSize(uint256 newParticipationSize) external onlyLoaner {
        participationSize = newParticipationSize;
        emit ParticipationSizeChanged(newParticipationSize);
    }

    // /**
    //  * @dev Set new loans limit. Only owner can change parameters.
    //  * @param newLoansLimit New loans limit
    //  */
    // function setLoansLimit(uint256 newLoansLimit) external onlyOwnerOrManager {
    //     maxLoans = newLoansLimit;
    //     emit LoansLimitChanged(maxLoans);
    // }

    /**
     * @dev Set new community. Only owner can change parameters.
     * @param newCommunity New community.
     */
    function setCommunity(ICommunity newCommunity) external onlyLoaner {
        community = newCommunity;
        emit CommunityChanged(address(newCommunity));
    }
    
    /**
     * @dev set funds manager address
     * @param newFundsManager New funds manager.
     */
    function setFundsManager(address newFundsManager) external onlyLoaner {
        fundsManager = newFundsManager;
        emit FundsManagerChanged(newFundsManager);
    }

    /**
     * @dev Allow pausing of deposits in case of emergency
     * @param status New deposit status
     */
    function changeJoiningPauseStatus(bool status) external onlyOwnerOrManager {
        isJoiningPaused = status;
        emit JoiningPauseStatusChanged(status);
    }

    /**
     * @dev Minimum absolute value of yes votes, rather than ratio of yes to no
     * @param amount Size of loan
     * @param yesVotes Number of yes votes
     * @return Whether a loan has reached the required voting threshold
     */
    function votesThresholdReached(uint256 amount, uint256 yesVotes) public view returns (bool) {
        return amount.mul(participationSize) <= yesVotes.mul(10000);
    }

    /**
     * @dev Minimum ratio of yes to no
     * @param yes number of approval votes
     * @param no number of reject votes
     * @return Whether a loan has reached minimum yes to no ratio
     */
    function approvalRateThresholdReached(uint256 yes, uint256 no) public view returns (bool) {
        return yes.mul(10000).div(yes.add(no)) >= approvalRate;
    }
    
    /**
     * @dev Minimum participation rate from the community managers
     * @param participation ration of managers participating in the voting
     * @return Whether the loan reached the minimum participation rate
     */
    function participationRateThresholdReached(uint256 participation) public view returns (bool) {
        return participation >= participationRate;
    }

    /**
     * @dev Join the pool by depositing stablecoin token
     * @param amount amount of stablecoin token to deposit
     */
    function join(uint256 amount) external joiningNotPaused {
        uint256 mintedAmount = mint(amount);

        latestJoinBlock[tx.origin] = block.number;
        require(stablecoin.transferFrom(msg.sender, address(this), amount));

        emit Joined(msg.sender, amount, mintedAmount);
    }

    /**
     * @dev Exit pool
     * This function will withdraw the existing tokens backing the pool value
     * @param amount amount of pool tokens to redeem for underlying tokens
     */
    function exit(uint256 amount) external nonReentrant sync {
    // function exit(uint256 amount) external nonReentrant{ 
        require(block.number != latestJoinBlock[tx.origin], "LoanerPool: Cannot join and exit in same block");
        require(amount <= balanceOf(msg.sender), "LoanerPool: insufficient funds");

        uint256 amountToWithdraw = poolValue().mul(amount).div(totalSupply());
        require(amountToWithdraw <= liquidValue(), "LoanerPool: Not enough liquidity in pool");

        // burn tokens sent
        _burn(msg.sender, amount);

        if (amountToWithdraw > currencyBalance()) {
            uint256 neededBalance = amountToWithdraw.sub(currencyBalance());
            IAToken aToken = getAToken();
            aToken.redeem(neededBalance.mul(aTokenBalance().div(aTokenValue())));
            require(amountToWithdraw <= currencyBalance(), "LoanerPool: Not enough funds were withdrawn from Moola");
        }

        require(stablecoin.transfer(msg.sender, amountToWithdraw));

        emit Exited(msg.sender, amountToWithdraw);
    }

    /**
     * @dev Fund a loan which meets the pool parameters
     * @param loanToken LoanToken to fund
     */
    function fund(ILoanToken loanToken) external {
        require(loanToken.borrower() == msg.sender, "LoanerPool: Sender is not borrower");
        require(loanToken.isLoanToken(), "LoanerPool: Only LoanTokens can be funded");
        require(loanToken.currencyToken() == stablecoin, "LoanerPool: Only the same currency LoanTokens can be funded");
        // require(_loans.length < maxLoans, "LoanerPool: Loans number has reached the limit");

        // (uint256 amount, uint256 apy, uint256 term) = loanToken.getParameters();
        (uint256 amount,,) = loanToken.getParameters();
        (uint256 participation, uint256 no, uint256 yes) = community.getResults(address(loanToken));

        // require(loanSizeWithinBounds(amount), "LoanerPool: Loan size is out of bounds");
        // require(loanTermWithinBounds(term), "LoanerPool: Loan term is out of bounds");
        // require(loanIsAttractiveEnough(apy), "LoanerPool: APY is out of bounds");
        require(votesThresholdReached(amount, yes), "LoanerPool: Not enough votes given for the loan");
        require(participationRateThresholdReached(participation), "LoanerPool: Not enough community managers participated");
        require(approvalRateThresholdReached(yes, no), "LoanerPool: Loan does not have enough approval ratings");

        _loans.push(loanToken);
        stablecoin.approve(address(loanToken), amount);
        loanToken.fund();

        emit Funded(address(loanToken), amount);
    }

    /**
     * @dev For settled loans, redeem LoanTokens for underlying funds
     * @param loanToken Loan to reclaim capital from (must be previously funded)
     */
    function reclaim(ILoanToken loanToken) external {
        require(loanToken.isLoanToken(), "LoanerPool: Only LoanTokens can be used to reclaimed");

        ILoanToken.Status status = loanToken.status();
        require(status >= ILoanToken.Status.Settled, "LoanerPool: LoanToken is not closed yet");

        // call redeem function on LoanToken
        uint256 balanceBefore = stablecoin.balanceOf(address(this));
        loanToken.redeem(loanToken.balanceOf(address(this)));
        uint256 balanceAfter = stablecoin.balanceOf(address(this));

        // gets reclaimed amount and redeemed back to pool
        uint256 fundsReclaimed = balanceAfter.sub(balanceBefore);

        // remove loan from loan array
        for (uint256 index = 0; index < _loans.length; index++) {
            if (_loans[index] == loanToken) {
                _loans[index] = _loans[_loans.length - 1];
                _loans.pop();

                emit Reclaimed(address(loanToken), fundsReclaimed);
                return;
            }
        }
        // If we reach this, it means loanToken was not present in _loans array
        // This prevents invalid loans from being reclaimed
        revert("LoanerPool: This loan has not been funded by the lender");
    }

    /**
     * @dev Deposit idle funds into moola pool and earn interest
     * Called by owner to help manage funds in pool and save on gas for deposits
     * @param currencyAmount Amount of funds to deposit into curve
     */
    function flush(uint256 currencyAmount) external onlyOwner {
        require(currencyAmount <= currencyBalance(), "LoanerPool: Insufficient Balance");
        ILendingPool lendingPool = ILendingPool(moolaAddressesProvider.getLendingPool());
        address lendingPoolCore = moolaAddressesProvider.getLendingPoolCore();

        stablecoin.approve(lendingPoolCore, currencyAmount);
        lendingPool.deposit(address(stablecoin), currencyAmount, 0);

        emit Flushed(currencyAmount);
    }

    /**
     * @dev Remove liquidity from moola markets
     * @param aAmount amount of  aTokens
     */
    function pull(uint256 aAmount) external onlyOwner {
        require(aAmount <= aTokenBalance(), "LoanerPool; Insufficient aToken Balance");
        IAToken aToken = getAToken();
        aToken.redeem(aAmount);
    }

    /**
     * @dev Calculate pool value in the stablecoin
     * "virtual price" of entire pool - LoanTokens, stablecoin and aTOkens
     * @return pool value in the stablecoin
     */
    function poolValue() public view returns (uint256) {
        // this assumes defaulted loans are worth their full value
        return liquidValue().add(totalLoansValue());
    }

    /**
     * @dev Get the aToken from the moola address provider
     * @return AToken for the stablecoin pool
     */
    function getAToken() public view returns (IAToken) {
        ILendingPool lendingPool = ILendingPool(moolaAddressesProvider.getLendingPool());

        // Initialize aToken
        (, , , , , , , , , , , address aTokenAddress, ) = lendingPool
            .getReserveData(address(stablecoin));
        return IAToken(aTokenAddress);
    }

    /**
     * @dev Value calculation for the loans taken by the pool
     * @param loan Loan to calculate value for
     * @return value of a given loan
     */
    function loanValue(ILoanToken loan) public view returns (uint256) {
        uint256 _balance = loan.balanceOf(address(this));
        if (_balance == 0) {
            return 0;
        }

        uint256 passed = block.timestamp.sub(loan.start());
        if (passed > loan.term()) {
            passed = loan.term();
        }

        uint256 helper = loan.amount().mul(loan.apy()).mul(passed).mul(_balance);
        // assume year is 365 days
        uint256 interest = helper.div(365 days).div(10000).div(loan.debt());

        return loan.amount().mul(_balance).div(loan.debt()).add(interest);
    }

    /**
     * @dev Loop through loan tokens and calculate theoretical value of all loans
     * There should never be too many loans in the pool to run out of gas
     * @return Theoretical value of all the loans funded by this strategy
     */
    function totalLoansValue() public view returns (uint256) {
        if (inSync) {
            return loansValueCache;
        }
        uint256 totalValue;
        for (uint256 index = 0; index < _loans.length; index++) {
            totalValue = totalValue.add(loanValue(_loans[index]));
        }
        return totalValue;
    }

    /**
     * @dev Value of liquid assets in the pool
     * @return Liquid value of pool assets
     */
    function liquidValue() public view returns (uint256) {
        return currencyBalance().add(aTokenValue());
    }

    /**
     * @dev Currency token balance
     * @return Currency token balance
     */
    function currencyBalance() internal view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }

    /**
     * @dev Get total balance of currency aTokens
     * @return Balance of aTokens in this contract
     */
    function aTokenBalance() public view returns (uint256) {
        IAToken aToken = getAToken();
        return aToken.principalBalanceOf(address(this));
    }

    /**
     * @dev Value of aTokens in the pool
     * Will return sync value if inSync
     * @return aTokenValue in underlying currency (principal + interest).
     */
    function aTokenValue() public view returns (uint256) {
        IAToken aToken = getAToken(); 
        return aToken.balanceOf(address(this));
    }
    // /**
    //  * @dev Check if a loan is within APY bounds
    //  * @param apy APY of loan
    //  * @return Whether a loan is within APY bounds
    //  */
    // function loanIsAttractiveEnough(uint256 apy) public view returns (bool) {
    //     return apy >= minApy && apy <= maxApy;
    // }

    // /**
    //  * @dev Check if a loan is within size bounds
    //  * @param amount Size of loan
    //  * @return Whether a loan is within size bounds
    //  */
    // function loanSizeWithinBounds(uint256 amount) public view returns (bool) {
    //     return amount >= minSize && amount <= maxSize;
    // }

    // /**
    //  * @dev Check if loan term is within term bounds
    //  * @param term Term of loan
    //  * @return Whether loan term is within term bounds
    //  */
    // function loanTermWithinBounds(uint256 term) public view returns (bool) {
    //     return term >= minTerm && term <= maxTerm;
    // }

    /**
     * @param depositedAmount Amount of stablecoin deposited
     * @return amount minted from this transaction
     */
    function mint(uint256 depositedAmount) internal returns (uint256) {
        uint256 mintedAmount = depositedAmount;
        if (mintedAmount == 0) {
            return mintedAmount;
        }

        // first depositor mints same amount deposited
        if (totalSupply() > 0) {
            mintedAmount = totalSupply().mul(depositedAmount).div(poolValue());
        }
        // mint pool tokens
        _mint(msg.sender, mintedAmount);

        return mintedAmount;
    }
}