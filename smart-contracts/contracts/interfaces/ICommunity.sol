// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

interface ICommunity {
    function allowedBorrowers(address borrower) external view returns(uint256);
    function getResults(address id)
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        );

    function submit(address id) external;
    function retract(address id) external;
    function withdraw(address id, uint256 stake) external;
    function approve(address id, uint256 stake) external;
    function reject(address id, uint256 stake) external;
    function previousCommunityContract() external view returns(address);
    function hasRole(bytes32 role, address account) external view returns(bool);
    function migrateFunds(address _newCommunity, address _newCommunityManager) external;
}