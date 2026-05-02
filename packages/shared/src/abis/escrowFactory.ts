export const escrowFactoryAbi = [
  {
    "type": "function",
    "name": "createEscrow",
    "inputs": [
      {
        "name": "freelancer",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "milestones",
        "type": "tuple[]",
        "internalType": "struct MilestoneEscrow.MilestoneInput[]",
        "components": [
          {
            "name": "title",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "amount",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "escrow",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "escrowCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEscrow",
    "inputs": [
      {
        "name": "escrowId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct EscrowFactory.EscrowRecord",
        "components": [
          {
            "name": "escrow",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "client",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "freelancer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "totalAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "milestoneCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEscrowsByAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isTaskLoopEscrow",
    "inputs": [
      {
        "name": "escrow",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "deployedByFactory",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "EscrowCreated",
    "inputs": [
      {
        "name": "escrowId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "escrow",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "client",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "freelancer",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "totalAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "milestoneCount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ZeroAddress",
    "inputs": []
  }
] as const;
