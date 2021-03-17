// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import "./LoanerPool.sol";
import "../interfaces/ILoanerPoolFactory.sol";

/**
 * @notice Welcome to LoanerPoolFactory
 */
contract LoanerPoolFactory {
    address public cUSDAddress;
    address public loanerAddress;
    address public moolaAddressesProviderAddress;

    constructor(address _cUSDAddress, address _loanerAddress, address _moolaAddressesProviderAddress) public {
        cUSDAddress = _cUSDAddress;
        loanerAddress = _loanerAddress;
        moolaAddressesProviderAddress = _moolaAddressesProviderAddress;
    }

    modifier onlyLoaner() {
        require(msg.sender == loanerAddress, "LoanerPoolFactory: only loaner address allowed");
        _;
    }

    /**
     * @dev Add a new pool. Can be used only by an admin.
     * For further information regarding each parameter, see
     * *LoanerPool* smart contract constructor.
     */
    function deployPool(
        address _fundsManager,
        address _communityAddress
    ) external onlyLoaner returns (address) {
        return
            address(
                new LoanerPool(
                    moolaAddressesProviderAddress,
                    cUSDAddress,
                    _communityAddress,
                    _fundsManager,
                    msg.sender
                )
            );
    }
}
