// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TaskLoopRegistry {
    enum TaskStatus {
        Open,
        Running,
        Completed,
        Failed
    }

    struct Task {
        address requester;
        string prompt;
        bytes32 resultHash;
        TaskStatus status;
        uint256 createdAt;
    }

    uint256 public nextTaskId = 1;
    mapping(uint256 taskId => Task task) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed requester, string prompt);
    event TaskStatusUpdated(uint256 indexed taskId, TaskStatus status, bytes32 resultHash);

    function createTask(string calldata prompt) external returns (uint256 taskId) {
        require(bytes(prompt).length > 0, "EMPTY_PROMPT");

        taskId = nextTaskId++;
        tasks[taskId] = Task({
            requester: msg.sender,
            prompt: prompt,
            resultHash: bytes32(0),
            status: TaskStatus.Open,
            createdAt: block.timestamp
        });

        emit TaskCreated(taskId, msg.sender, prompt);
    }

    function updateTaskStatus(uint256 taskId, TaskStatus status, bytes32 resultHash) external {
        Task storage task = tasks[taskId];
        require(task.requester != address(0), "TASK_NOT_FOUND");
        require(msg.sender == task.requester, "NOT_REQUESTER");

        task.status = status;
        task.resultHash = resultHash;

        emit TaskStatusUpdated(taskId, status, resultHash);
    }
}
