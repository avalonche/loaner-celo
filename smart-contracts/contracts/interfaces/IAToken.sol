// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;


// Aave aToken interface
// Documentation: https://docs.aave.com/developers/developing-on-aave/the-protocol/atokens
interface IAToken {
    function redeem(uint256 _amount) external;

    function balanceOf(address owner) external view returns (uint256);

    function principalBalanceOf(address owner) external view returns (uint256);
}