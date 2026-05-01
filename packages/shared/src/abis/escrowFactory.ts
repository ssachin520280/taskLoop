export const escrowFactoryAbi = [
  {
    type: "function",
    name: "createEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "freelancer", type: "address" },
      {
        name: "milestones",
        type: "tuple[]",
        components: [
          { name: "title", type: "string" },
          { name: "amount", type: "uint256" }
        ]
      }
    ],
    outputs: [{ name: "escrow", type: "address" }]
  },
  {
    type: "function",
    name: "escrowCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getEscrow",
    stateMutability: "view",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "escrow", type: "address" },
          { name: "client", type: "address" },
          { name: "freelancer", type: "address" },
          { name: "totalAmount", type: "uint256" },
          { name: "milestoneCount", type: "uint256" },
          { name: "createdAt", type: "uint256" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getEscrowsByAccount",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "isTaskLoopEscrow",
    stateMutability: "view",
    inputs: [{ name: "escrow", type: "address" }],
    outputs: [{ name: "deployedByFactory", type: "bool" }]
  },
  {
    type: "event",
    name: "EscrowCreated",
    inputs: [
      { name: "escrowId", type: "uint256", indexed: true },
      { name: "escrow", type: "address", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "freelancer", type: "address", indexed: false },
      { name: "totalAmount", type: "uint256", indexed: false },
      { name: "milestoneCount", type: "uint256", indexed: false }
    ]
  }
] as const;
