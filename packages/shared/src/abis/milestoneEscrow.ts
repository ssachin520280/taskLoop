export const milestoneEscrowAbi = [
  {
    type: "function",
    name: "fund",
    stateMutability: "payable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "submitEvidence",
    stateMutability: "nonpayable",
    inputs: [
      { name: "milestoneId", type: "uint256" },
      { name: "evidence", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "approveMilestone",
    stateMutability: "nonpayable",
    inputs: [{ name: "milestoneId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "disputeMilestone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "milestoneId", type: "uint256" },
      { name: "reason", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "resolveDispute",
    stateMutability: "nonpayable",
    inputs: [{ name: "milestoneId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancel",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "getMilestone",
    stateMutability: "view",
    inputs: [{ name: "milestoneId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "title", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "evidence", type: "string" },
          { name: "status", type: "uint8" },
          { name: "submittedAt", type: "uint64" },
          { name: "approvedAt", type: "uint64" },
          { name: "releasedAt", type: "uint64" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getMilestones",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "title", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "evidence", type: "string" },
          { name: "status", type: "uint8" },
          { name: "submittedAt", type: "uint64" },
          { name: "approvedAt", type: "uint64" },
          { name: "releasedAt", type: "uint64" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "client",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "freelancer",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "totalAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "releasedAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "status",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  },
  {
    type: "function",
    name: "milestoneCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "event",
    name: "EscrowFunded",
    inputs: [
      { name: "client", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "EvidenceSubmitted",
    inputs: [
      { name: "milestoneId", type: "uint256", indexed: true },
      { name: "freelancer", type: "address", indexed: true },
      { name: "evidence", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "MilestoneApproved",
    inputs: [
      { name: "milestoneId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true }
    ]
  },
  {
    type: "event",
    name: "MilestoneReleased",
    inputs: [
      { name: "milestoneId", type: "uint256", indexed: true },
      { name: "freelancer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "MilestoneDisputed",
    inputs: [
      { name: "milestoneId", type: "uint256", indexed: true },
      { name: "reporter", type: "address", indexed: true },
      { name: "reason", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "EscrowCancelled",
    inputs: [
      { name: "client", type: "address", indexed: true },
      { name: "refundAmount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "EscrowCompleted",
    inputs: [{ name: "releasedAmount", type: "uint256", indexed: false }]
  }
] as const;
