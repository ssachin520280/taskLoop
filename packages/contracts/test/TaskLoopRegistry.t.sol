// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TaskLoopRegistry} from "../src/TaskLoopRegistry.sol";

contract TaskLoopRegistryTest {
    function testCreateTask() public {
        TaskLoopRegistry registry = new TaskLoopRegistry();

        uint256 taskId = registry.createTask("Summarize agent output");
        (
            address requester,
            string memory prompt,
            bytes32 resultHash,
            TaskLoopRegistry.TaskStatus status,
            uint256 createdAt
        ) = registry.tasks(taskId);

        require(requester == address(this), "wrong requester");
        require(keccak256(bytes(prompt)) == keccak256(bytes("Summarize agent output")), "wrong prompt");
        require(resultHash == bytes32(0), "wrong result");
        require(status == TaskLoopRegistry.TaskStatus.Open, "wrong status");
        require(createdAt > 0, "missing timestamp");
    }

    function testUpdateTaskStatus() public {
        TaskLoopRegistry registry = new TaskLoopRegistry();
        uint256 taskId = registry.createTask("Run evaluation");
        bytes32 resultHash = keccak256("result");

        registry.updateTaskStatus(taskId, TaskLoopRegistry.TaskStatus.Completed, resultHash);
        (, , bytes32 storedResultHash, TaskLoopRegistry.TaskStatus status, ) = registry.tasks(taskId);

        require(storedResultHash == resultHash, "wrong result hash");
        require(status == TaskLoopRegistry.TaskStatus.Completed, "wrong status");
    }
}
