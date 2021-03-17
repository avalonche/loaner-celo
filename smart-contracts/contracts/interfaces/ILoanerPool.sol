// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.6.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * LoanerPool is an ERC20 which represents a share of a pool
 */
interface ILoanerPool is IERC20 {
    /// @dev pool token (stablcoin)
    function currencyToken() external view returns (IERC20);

    /**
     * @dev join pool
     * 1. Transfer stablecoin from sender
     * 2. Mint pool tokens based on value to sender
     */
    function join(uint256 amount) external;

    /**
     * @dev exit pool
     * 1. Transfer pool tokens from sender
     * 2. Burn pool tokens
     * 3. Transfer value of pool tokens in stablecoin to sender
     */
    function exit(uint256 amount) external;

    function fund(address loan) external;
    function setFundsManager(address id) external;
    function setCommunity(address id) external;
}