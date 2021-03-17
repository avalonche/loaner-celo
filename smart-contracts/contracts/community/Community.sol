// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ICommunity.sol";
import "../interfaces/ILoanFactory.sol";
import "../interfaces/ILoanToken.sol";

/**
 * @dev Each community will be deployed by the Loaner contract
 * and have its own lending pool. Only members of the community
 * can borrow from the pool approved by the managers. Managers
 * need to stake tokens proportional to the loan size and will
 * have their stake slashed if the loan defaults and rewards
 * if the loan is repaid. A minimum participation rate by the
 * managers is needed to approve the loan
 */
contract Community is AccessControl {
    using SafeMath for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    enum BorrowerState {NONE, Valid, Locked, Removed} // starts by 0 (when user is not added yet)
    enum LoanStatus {Void, Pending, Retracted, Running, Settled, Defaulted}

    struct Loan {
        address creator;
        uint256 numVotes;
        uint256 timestamp;
        mapping(bool => uint256) approvalRate;
        mapping(address => mapping(bool => uint256)) votes;
    }

    IERC20 public cUSD;
    ILoanFactory public factory;

    mapping(address => BorrowerState) public allowedBorrowers;
    mapping(address => Loan) public loans;

    address public previousCommunityContract;
    address public loanerAddress;
    bool public locked;
    uint256 public lossFactor;
    uint256 public numManagers;

    event ManagerAdded(address indexed _account);
    event ManagerRemoved(address indexed _account);
    event BorrowerAdded(address indexed _account);
    event BorrowerLocked(address indexed _account);
    event BorrowerUnlocked(address indexed _account);
    event BorrowerRemoved(address indexed _account);
    event BorrowerClaim(address indexed _account, uint256 _amount);
    event CommunityLocked(address indexed _by);
    event CommunityUnlocked(address indexed _by);
    event LoanSubmitted(address id);
    event LoanRetracted(address id);
    event Voted(address loanToken, address voter, bool choice, uint256 stake);
    event Withdrawn(address loanToken, address voter, uint256 stake, uint256 received);
    event MigratedFunds(address indexed _to, uint256 _amount);

    /**
     * @dev Constructor with custom fields, choosen by the community.
     * @param _firstManager Comminuty's first manager. Will
     * be able to add others.
     * @param _previousCommunityContract previous smart contract address of community.
     * @param _cUSDAddress cUSD smart contract address.
     * @param _loanerAddress Loaner smart contract address
     */
    constructor(
        address _firstManager,
        address _previousCommunityContract,
        address _cUSDAddress,
        address _loanFactoryAddress,
        address _loanerAddress
    ) public {
        _setupRole(MANAGER_ROLE, _firstManager);
        _setRoleAdmin(MANAGER_ROLE, MANAGER_ROLE);
        numManagers = 1;
        emit ManagerAdded(_firstManager);

        previousCommunityContract = _previousCommunityContract;
        cUSD = IERC20(_cUSDAddress);
        factory = ILoanFactory(_loanFactoryAddress);
        loanerAddress = _loanerAddress;
        locked = false;
        lossFactor = 2500;
    }

    modifier onlyValidBorrower() {
        require(allowedBorrowers[msg.sender] != BorrowerState.Locked, "Community: borrower is locked");
        require(
            allowedBorrowers[msg.sender] != BorrowerState.Removed,
            "Community: borrower is removed"
        );
        require(
            allowedBorrowers[msg.sender] == BorrowerState.Valid,
            "Community: borrower is not valid"
        );
        _;
    }

    modifier onlyManagers() {
        require(hasRole(MANAGER_ROLE, msg.sender), "Community: Only managers");
        _;
    }

    modifier onlyCreator(address id) {
        require(loans[id].creator == msg.sender, "Community: Not Sender's loan");
        _;
    }

    modifier onlyNotExistingLoans(address id) {
        require(status(id) == LoanStatus.Void, "Community: Loan already created");
        _;
    }

    modifier onlyPendingLoans(address id) {
        require(status(id) == LoanStatus.Pending, "Community: Loan is not currently pending");
        _;
    }

    modifier onlyNotRunningLoans(address id) {
        require(status(id) != LoanStatus.Running, "Community: Loan is currently running");
        _;
    }

    modifier onlyLoaner() {
        require(msg.sender == loanerAddress, "Community: only Loaner address allowed");
        _;
    }

    /**
     * @dev Allow community managers to add other managers.
     */
    function addManager(address _account) external onlyManagers {
        grantRole(MANAGER_ROLE, _account);
        numManagers = numManagers.add(1);
        emit ManagerAdded(_account);
    }

    /**
     * @dev Allow community managers to remove other managers.
     */
    function removeManager(address _account) external onlyManagers {
        revokeRole(MANAGER_ROLE, _account);
        numManagers = numManagers.sub(1);
        emit ManagerRemoved(_account);
    }

    /**
     * @dev Allow community managers to add borrowers.
     */
    function addBorrower(address _account) external onlyManagers {
        require(allowedBorrowers[_account] != BorrowerState.Valid, "Community: Borrower already added");
        allowedBorrowers[_account] = BorrowerState.Valid;
        emit BorrowerAdded(_account);
    }

    /**
     * @dev Allow community managers to lock borrowers.
     */
    function lockBorrower(address _account) external onlyManagers {
        require(allowedBorrowers[_account] == BorrowerState.Valid, "Community: Borrower state invalid");
        allowedBorrowers[_account] = BorrowerState.Locked;
        emit BorrowerLocked(_account);
    }

    /**
     * @dev Allow community managers to unlock locked borrowers.
     */
    function unlockBorrower(address _account) external onlyManagers {
        require(allowedBorrowers[_account] == BorrowerState.Locked, "Community: borrower not locked");
        allowedBorrowers[_account] = BorrowerState.Valid;
        emit BorrowerUnlocked(_account);
    }

    /**
     * @dev Allow community managers to remove borrowers.
     */
    function removeBorrower(address _account) external onlyManagers {
        allowedBorrowers[_account] = BorrowerState.Removed;
        emit BorrowerRemoved(_account);
    }

    /**
     * @dev Allow community managers to lock community loans.
     */
    function lock() external onlyManagers {
        locked = true;
        emit CommunityLocked(msg.sender);
    }

    /**
     * @dev Allow community managers to unlock community loans.
     */
    function unlock() external onlyManagers {
        locked = false;
        emit CommunityUnlocked(msg.sender);
    }

    /**
     * @dev Allow community members to submit a loan
     */

    function submit(address id) external onlyValidBorrower onlyNotExistingLoans(id) {
        require(!locked, "Community: New submissions are locked");
        require(ILoanToken(id).borrower() == msg.sender, "Community: Submitter is not borrower");
        require(factory.isLoanToken(id), "Community: Only loans created through the loan factory accepted");
        loans[id] = Loan({creator: msg.sender, numVotes: 0, timestamp: block.timestamp});

        emit LoanSubmitted(id);
    }

    /**
     * @dev Remove Loan from community
     * Can only be retracted by loan creator
     * @param id Loan ID
     */
    function retract(address id) external onlyPendingLoans(id) onlyCreator(id) {
        loans[id].creator = address(0);
        loans[id].approvalRate[true] = 0;
        loans[id].approvalRate[false] = 0;

        emit LoanRetracted(id);
    }

    /**
     * @dev Vote on a loan by staking
     * @param id Loan ID
     * @param stake Amount to stake
     * @param choice Voter choice. false = Reject, true = Approve
     */
    function vote(
        address id,
        uint256 stake,
        bool choice
    ) onlyManagers internal {
        require(loans[id].votes[msg.sender][!choice] == 0, "Community: Cannot vote both approve and reject");
        if (loans[id].votes[msg.sender][choice] == 0) {
            loans[id].numVotes = loans[id].numVotes.add(1);
        }
        loans[id].approvalRate[choice] = loans[id].approvalRate[choice].add(stake);
        loans[id].votes[msg.sender][choice] = loans[id].votes[msg.sender][choice].add(stake);
        
        cUSD.approve(address(this), stake);
        require(cUSD.transferFrom(msg.sender, address(this), stake));
        emit Voted(id, msg.sender, choice, stake);
    }

    /**
     * @dev Approve on a loan by staking
     * @param id Loan ID
     * @param stake Amount of token to stake
     */
    function approve(address id, uint256 stake) external onlyPendingLoans(id) {
        vote(id, stake, true);
    }

    /**
     * @dev Reject on a loan
     * @param id Loan ID
     * @param stake Amount of token to stake
     */
    function reject(address id, uint256 stake) external onlyPendingLoans(id) {
        vote(id, stake, false);
    }
    
    /**
     * @dev Withdraw stake on a loan and remove votes.
     * Unstaking only allowed for loans that are not Running
     * @param id Loan ID
     * @param stake Amount of token to unstake
     */
    function withdraw(address id, uint256 stake) external onlyNotRunningLoans(id) {
        bool choice = loans[id].votes[msg.sender][true] > 0;
        LoanStatus loanStatus = status(id);

        require(loans[id].votes[msg.sender][choice] >= stake,
            "Community: Cannot withdraw more than was staked");

        uint256 amountToTransfer = stake;
        if (loanStatus > LoanStatus.Running) {
            // check if manager correctly approved repaid loan
            bool correct = wasPredictionCorrect(id, choice);
            if (correct) {
                // if correct, take some from incorrect side's stake
                // amount taken from incorrect side
                amountToTransfer = amountToTransfer.add(
                    bounty(id, !choice).mul(stake).div(loans[id].approvalRate[choice]));
            } else {
                // if incorrect, calculate loss of stake
                // stake - (stake * lossFactor)
                uint256 lostAmount = amountToTransfer.mul(lossFactor).div(10000);
                amountToTransfer = amountToTransfer.sub(lostAmount);
            }
        }

        // if loan still pending, update total votes
        if (loanStatus == LoanStatus.Pending) {
            loans[id].approvalRate[choice] = loans[id].approvalRate[choice].sub(stake);
            loans[id].numVotes = loans[id].numVotes.sub(1);
        }

        // update account votes
        loans[id].votes[msg.sender][choice] = loans[id].votes[msg.sender][choice].sub(stake);

        // transfer tokens to sender and emit event
        require(cUSD.transfer(msg.sender, amountToTransfer));
        emit Withdrawn(id, msg.sender, stake, amountToTransfer);
    }

    /**
     * @dev Total amount of funds given to correct voters
     * @param id Loan ID
     * @param incorrectChoice Vote which was incorrect
     * @return token amount given to correct voters
     */
    function bounty(address id, bool incorrectChoice) public view returns (uint256) {
        // reward = (incorrect_tokens_staked) * (loss_factor)
        return loans[id].approvalRate[incorrectChoice].mul(
            lossFactor).div(10000);
    }
    
    /**
     * @dev Check if a prediction was correct for a specific loan and vote
     * @param id Loan ID
     * @param choice Outcome prediction
     */
    function wasPredictionCorrect(address id, bool choice) internal view returns (bool) {
        if (status(id) == LoanStatus.Settled && choice) {
            return true;
        }
        if (status(id) == LoanStatus.Defaulted && !choice) {
            return true;
        }
        return false;
    }

    /**
     * @dev Get number of rejections for specific manager and loan
     * @param id Loan ID
     * @param voter Voter account
     */
    function getRejectVote(address id, address voter) public view returns (uint256) {
        return loans[id].votes[voter][false];
    }

    /**
     * @dev Get number of YES votes for a specific account and loan
     * @param id Loan ID
     * @param voter Voter account
     */
    function getApproveVote(address id, address voter) public view returns (uint256) {
        return loans[id].votes[voter][true];
    }

    /**
     * @dev Get total NO votes for a specific loan
     * @param id Loan ID
     */
    function getTotalRejectVotes(address id) public view returns (uint256) {
        return loans[id].approvalRate[false];
    }

    /**
     * @dev Get total YES votes for a specific loan
     * @param id Loan ID
     */
    function getTotalApproveVotes(address id) public view returns (uint256) {
        return loans[id].approvalRate[true];
    }

    /**
     * @dev Get percentage of managers participated in the specific loan
     * @param id Loan ID
     */
    function getParticipation(address id) public view returns (uint256) {
        return loans[id].numVotes.mul(10000).div(numManagers);
    }

    /**
     * @dev Get approval results for a specific loan
     * @param id Loan ID
     * @return (participation, total_no, total_yes)
     */
    function getResults(address id)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (getParticipation(id), getTotalRejectVotes(id), getTotalApproveVotes(id));
    }

    /**
     * @dev Get status for a specific loan
     * We rely on correct implementation of LoanToken
     * @param id Loan ID
     * @return Status of loan
     */
    function status(address id) public view returns (LoanStatus) {
        Loan storage loan = loans[id];
        // Void loan doesn't exist because timestamp is zero
        if (loan.creator == address(0) && loan.timestamp == 0) {
            return LoanStatus.Void;
        }
        // Retracted loan was cancelled by borrower
        if (loan.creator == address(0) && loan.timestamp != 0) {
            return LoanStatus.Retracted;
        }
        // get internal status
        ILoanToken.Status loanInternalStatus = ILoanToken(id).status();

        // Running is Funded || Withdrawn
        if (loanInternalStatus == ILoanToken.Status.Funded || loanInternalStatus == ILoanToken.Status.Withdrawn) {
            return LoanStatus.Running;
        }
        // Settled has been paid back in full and past term
        if (loanInternalStatus == ILoanToken.Status.Settled) {
            return LoanStatus.Settled;
        }
        // Defaulted has not been paid back in full and past term
        if (loanInternalStatus == ILoanToken.Status.Defaulted) {
            return LoanStatus.Defaulted;
        }
        // otherwise return Pending
        return LoanStatus.Pending;
    }

    /**
     * @dev Migrate funds in current community to new one.
     */
    function migrateFunds(address _newCommunity, address _newCommunityManager)
        external
        onlyLoaner
    {
        ICommunity newCommunity = ICommunity(_newCommunity);
        require(
            newCommunity.hasRole(MANAGER_ROLE, _newCommunityManager) == true,
            "NOT_ALLOWED"
        );
        require(
            newCommunity.previousCommunityContract() == address(this),
            "NOT_ALLOWED"
        );
        uint256 balance = cUSD.balanceOf(address(this));
        bool success = cUSD.transfer(_newCommunity, balance);
        require(success, "NOT_ALLOWED");
        emit MigratedFunds(_newCommunity, balance);
    }

    function joinFromMigratedCommunity() external {
        // no need to check if it's a borrower, as the state is copied
        allowedBorrowers[msg.sender] = BorrowerState(ICommunity(previousCommunityContract).allowedBorrowers(msg.sender));
    }
}