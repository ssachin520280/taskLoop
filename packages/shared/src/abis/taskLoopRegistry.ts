export const taskLoopRegistryAbi = [
  {
    type: "function",
    name: "createTask",
    stateMutability: "nonpayable",
    inputs: [{ name: "prompt", type: "string" }],
    outputs: [{ name: "taskId", type: "uint256" }]
  },
  {
    type: "function",
    name: "updateTaskStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "resultHash", type: "bytes32" }
    ],
    outputs: []
  },
  {
    type: "event",
    name: "TaskCreated",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "prompt", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "TaskStatusUpdated",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "status", type: "uint8", indexed: false },
      { name: "resultHash", type: "bytes32", indexed: false }
    ]
  }
] as const;
