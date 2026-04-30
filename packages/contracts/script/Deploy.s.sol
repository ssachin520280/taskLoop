// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TaskLoopRegistry} from "../src/TaskLoopRegistry.sol";

contract Deploy {
    function run() external returns (TaskLoopRegistry) {
        return new TaskLoopRegistry();
    }
}
