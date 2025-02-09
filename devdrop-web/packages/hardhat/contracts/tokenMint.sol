// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DevDropToken is ERC20 {
    event Minted(address to, uint256 amount);

    constructor() ERC20("DevDropToken", "DDT") {}

    function mint(address to, uint256 amount) public {
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount); 
        emit Minted(to, amount);
    }
}
