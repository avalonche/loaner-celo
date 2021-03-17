// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

interface ICommunityFactory {
    function deployCommunity(
        address _firstManager,
        address _previousCommunityAddress
    ) external returns(address);
    function loanerAddress() external view returns(address);
}