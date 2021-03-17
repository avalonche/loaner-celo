// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import {ILoanFactory} from "../interfaces/ILoanFactory.sol";

import {LoanToken, IERC20} from "./LoanToken.sol";

/**
 * @title LoanFactory
 * @notice Deploy LoanTokens with this Contract
 * @dev LoanTokens are deployed through a factory to ensure that all
 * LoanTokens adhere to the same contract code, rather than using an interface.
 */
contract LoanFactory is ILoanFactory {
    // @dev Track Valid LoanTokens
    mapping(address => bool) public override isLoanToken;

    address public override loanerAddress;
    IERC20 public currencyToken;

    /**
     * @dev Emitted when a LoanToken is created
     * @param contractAddress LoanToken contract address
     */
    event LoanTokenCreated(address contractAddress);

    /**
     * @dev Initialize this contract and set currency token
     * @param _currencyToken Currency token to lend
     */
    constructor(IERC20 _currencyToken, address _loanerAddress) public {
        currencyToken = _currencyToken;
        loanerAddress = _loanerAddress;
    }

    /**
     * @dev Deploy LoanToken with parameters
     * @param _amount Amount to borrow
     * @param _term Length of loan
     * @param _apy Loan yield
     */
    function createLoanToken(
        address _lender,
        uint256 _amount,
        uint256 _term,
        uint256 _apy
    ) external override {
        require(_amount > 0, "LoanFactory: Loans of amount 0, will not be approved");
        require(_term > 0, "LoanFactory: Loans cannot have instantaneous term of repay");

        address newToken = address(new LoanToken(currencyToken, msg.sender, _lender, _amount, _term, _apy));
        isLoanToken[newToken] = true;

        emit LoanTokenCreated(newToken);
    }
}