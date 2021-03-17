pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract cUSD is ERC20 {
    constructor() public ERC20("cUSD", "cUSD") {
        //
    }

    function testFakeFundAddress(address _addr) public {
        _mint(_addr, 1000 * 10 ** 18);
    }
}