// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EscrowFactory} from "../src/EscrowFactory.sol";

contract Deploy {
    function run() external returns (EscrowFactory) {
        return new EscrowFactory();
    }
}
