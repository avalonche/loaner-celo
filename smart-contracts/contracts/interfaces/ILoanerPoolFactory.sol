// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

interface ILoanerPoolFactory {
    function deployPool(
        address _fundsManager,
        address _communityAddress
    ) external returns(address);
    function loanerAddress() external view returns(address);
}