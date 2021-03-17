// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

interface ILoanFactory {
    function createLoanToken(
        address _lender,
        uint256 _amount,
        uint256 _term,
        uint256 _apy
    ) external;

    function isLoanToken(address) external view returns (bool);
    function loanerAddress() external view returns(address);
}