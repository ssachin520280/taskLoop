// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {MilestoneEscrow} from "./MilestoneEscrow.sol";

/// @title EscrowFactory
/// @notice Deploys TaskLoop milestone escrow contracts and indexes them for the UI.
contract EscrowFactory {
    struct EscrowRecord {
        address escrow;
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 milestoneCount;
        uint256 createdAt;
    }

    error ZeroAddress();

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed escrow,
        address indexed client,
        address freelancer,
        uint256 totalAmount,
        uint256 milestoneCount
    );

    EscrowRecord[] private escrows;
    mapping(address escrow => bool deployedByFactory) public isTaskLoopEscrow;
    mapping(address account => address[] escrows) private escrowsByAccount;

    /// @notice Deploys a new milestone escrow with the caller as client.
    /// @param freelancer Account that can submit evidence and receive released milestone payments.
    /// @param milestones Milestone titles and amounts.
    function createEscrow(
        address freelancer,
        MilestoneEscrow.MilestoneInput[] calldata milestones
    ) external returns (address escrow) {
        if (freelancer == address(0)) revert ZeroAddress();

        MilestoneEscrow.MilestoneInput[] memory milestoneCopy = milestones;
        MilestoneEscrow deployedEscrow = new MilestoneEscrow(msg.sender, freelancer, milestoneCopy);
        escrow = address(deployedEscrow);

        uint256 escrowId = escrows.length;
        uint256 totalAmount = deployedEscrow.totalAmount();
        uint256 milestoneCount = deployedEscrow.milestoneCount();

        escrows.push(
            EscrowRecord({
                escrow: escrow,
                client: msg.sender,
                freelancer: freelancer,
                totalAmount: totalAmount,
                milestoneCount: milestoneCount,
                createdAt: block.timestamp
            })
        );

        isTaskLoopEscrow[escrow] = true;
        escrowsByAccount[msg.sender].push(escrow);
        escrowsByAccount[freelancer].push(escrow);

        emit EscrowCreated(escrowId, escrow, msg.sender, freelancer, totalAmount, milestoneCount);
    }

    /// @notice Returns the total number of escrows created by the factory.
    function escrowCount() external view returns (uint256) {
        return escrows.length;
    }

    /// @notice Returns one escrow record.
    function getEscrow(uint256 escrowId) external view returns (EscrowRecord memory) {
        return escrows[escrowId];
    }

    /// @notice Returns escrow addresses where an account is client or freelancer.
    function getEscrowsByAccount(address account) external view returns (address[] memory) {
        return escrowsByAccount[account];
    }
}
