// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import "./Community.sol";
import "../interfaces/ICommunityFactory.sol";

/**
 * @notice Welcome to CommunityFactory
 */
contract CommunityFactory {
    address public cUSDAddress;
    address public loanerAddress;
    address public loanFactoryAddress;

    constructor(address _cUSDAddress, address _loanerAddress, address _loanFactoryAddress) public {
        cUSDAddress = _cUSDAddress;
        loanerAddress = _loanerAddress;
        loanFactoryAddress = _loanFactoryAddress;
    }

    modifier onlyLoaner() {
        require(msg.sender == loanerAddress, "CommunityFactory: only loaner address allowed");
        _;
    }

    /**
     * @dev Add a new community. Can be used only by an admin.
     * For further information regarding each parameter, see
     * *Community* smart contract constructor.
     */
    function deployCommunity(
        address _firstManager,
        address _previousCommunityAddress
    ) external onlyLoaner returns (address) {
        return
            address(
                new Community(
                    _firstManager,
                    _previousCommunityAddress,
                    cUSDAddress,
                    loanFactoryAddress,
                    msg.sender
                )
            );
    }
}