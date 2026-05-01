// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title MilestoneEscrow
/// @notice Holds client funds and releases milestone payments to a freelancer after evidence review.
/// @dev Designed for hackathon demos: simple roles, explicit state transitions, and no external dependencies.
contract MilestoneEscrow {
    enum EscrowStatus {
        Created,
        Funded,
        Cancelled,
        Completed
    }

    enum MilestoneStatus {
        Pending,
        EvidenceSubmitted,
        Approved,
        Released,
        Disputed
    }

    struct MilestoneInput {
        string title;
        uint256 amount;
    }

    struct Milestone {
        string title;
        uint256 amount;
        string evidence;
        MilestoneStatus status;
        uint64 submittedAt;
        uint64 approvedAt;
        uint64 releasedAt;
    }

    error ZeroAddress();
    error SameParties();
    error NoMilestones();
    error InvalidAmount();
    error IncorrectFunding(uint256 expected, uint256 received);
    error NotClient();
    error NotFreelancer();
    error NotParticipant();
    error InvalidEscrowStatus(EscrowStatus expected, EscrowStatus actual);
    error EscrowNotCancellable(EscrowStatus status);
    error InvalidMilestone(uint256 milestoneId);
    error InvalidMilestoneStatus(MilestoneStatus status);
    error EmptyEvidence();
    error TransferFailed();
    error Reentrancy();
    error UseFundFunction();

    event EscrowFunded(address indexed client, uint256 amount);
    event EvidenceSubmitted(uint256 indexed milestoneId, address indexed freelancer, string evidence);
    event MilestoneApproved(uint256 indexed milestoneId, address indexed client);
    event MilestoneReleased(uint256 indexed milestoneId, address indexed freelancer, uint256 amount);
    event MilestoneDisputed(uint256 indexed milestoneId, address indexed reporter, string reason);
    event MilestoneDisputeResolved(uint256 indexed milestoneId, address indexed client);
    event EscrowCancelled(address indexed client, uint256 refundAmount);
    event EscrowCompleted(uint256 releasedAmount);

    address public immutable client;
    address public immutable freelancer;
    uint256 public immutable totalAmount;

    EscrowStatus public status;
    uint256 public releasedAmount;
    uint256 public releasedMilestoneCount;

    Milestone[] private milestones;
    bool private locked;

    modifier onlyClient() {
        if (msg.sender != client) revert NotClient();
        _;
    }

    modifier onlyFreelancer() {
        if (msg.sender != freelancer) revert NotFreelancer();
        _;
    }

    modifier onlyParticipant() {
        if (msg.sender != client && msg.sender != freelancer) revert NotParticipant();
        _;
    }

    modifier inStatus(EscrowStatus expected) {
        if (status != expected) revert InvalidEscrowStatus(expected, status);
        _;
    }

    modifier validMilestone(uint256 milestoneId) {
        if (milestoneId >= milestones.length) revert InvalidMilestone(milestoneId);
        _;
    }

    modifier nonReentrant() {
        if (locked) revert Reentrancy();
        locked = true;
        _;
        locked = false;
    }

    /// @notice Creates a new milestone escrow.
    /// @param client_ The account that funds and approves work.
    /// @param freelancer_ The account that submits work and receives released funds.
    /// @param milestoneInputs Milestone titles and payment amounts.
    constructor(address client_, address freelancer_, MilestoneInput[] memory milestoneInputs) {
        if (client_ == address(0) || freelancer_ == address(0)) revert ZeroAddress();
        if (client_ == freelancer_) revert SameParties();
        if (milestoneInputs.length == 0) revert NoMilestones();

        client = client_;
        freelancer = freelancer_;
        status = EscrowStatus.Created;

        uint256 total;
        for (uint256 i = 0; i < milestoneInputs.length; i++) {
            MilestoneInput memory input = milestoneInputs[i];
            if (input.amount == 0) revert InvalidAmount();

            total += input.amount;
            milestones.push(
                Milestone({
                    title: input.title,
                    amount: input.amount,
                    evidence: "",
                    status: MilestoneStatus.Pending,
                    submittedAt: 0,
                    approvedAt: 0,
                    releasedAt: 0
                })
            );
        }

        totalAmount = total;
    }

    /// @notice Prevents accidental ETH transfers that would not update escrow state.
    receive() external payable {
        revert UseFundFunction();
    }

    /// @notice Funds the full escrow amount. Must be called once by the client.
    function fund() external payable onlyClient inStatus(EscrowStatus.Created) {
        if (msg.value != totalAmount) revert IncorrectFunding(totalAmount, msg.value);

        status = EscrowStatus.Funded;
        emit EscrowFunded(msg.sender, msg.value);
    }

    /// @notice Submits an evidence hash, URI, or short proof reference for a milestone.
    /// @param milestoneId Index of the milestone.
    /// @param evidence Hash or URI describing the delivered work.
    function submitEvidence(
        uint256 milestoneId,
        string calldata evidence
    ) external onlyFreelancer inStatus(EscrowStatus.Funded) validMilestone(milestoneId) {
        if (bytes(evidence).length == 0) revert EmptyEvidence();

        Milestone storage milestone = milestones[milestoneId];
        if (milestone.status != MilestoneStatus.Pending && milestone.status != MilestoneStatus.EvidenceSubmitted) {
            revert InvalidMilestoneStatus(milestone.status);
        }

        milestone.evidence = evidence;
        milestone.status = MilestoneStatus.EvidenceSubmitted;
        milestone.submittedAt = uint64(block.timestamp);

        emit EvidenceSubmitted(milestoneId, msg.sender, evidence);
    }

    /// @notice Approves evidence and releases the milestone payment to the freelancer.
    /// @param milestoneId Index of the milestone.
    function approveMilestone(
        uint256 milestoneId
    ) external onlyClient inStatus(EscrowStatus.Funded) validMilestone(milestoneId) nonReentrant {
        Milestone storage milestone = milestones[milestoneId];
        if (milestone.status != MilestoneStatus.EvidenceSubmitted) revert InvalidMilestoneStatus(milestone.status);

        milestone.status = MilestoneStatus.Approved;
        milestone.approvedAt = uint64(block.timestamp);
        emit MilestoneApproved(milestoneId, msg.sender);

        _releaseMilestone(milestoneId, milestone);
    }

    /// @notice Flags a milestone for dispute. Either participant can raise it before release.
    /// @param milestoneId Index of the milestone.
    /// @param reason Human-readable dispute reason or reference URI.
    function disputeMilestone(
        uint256 milestoneId,
        string calldata reason
    ) external onlyParticipant inStatus(EscrowStatus.Funded) validMilestone(milestoneId) {
        Milestone storage milestone = milestones[milestoneId];
        if (milestone.status == MilestoneStatus.Released) revert InvalidMilestoneStatus(milestone.status);

        milestone.status = MilestoneStatus.Disputed;
        emit MilestoneDisputed(milestoneId, msg.sender, reason);
    }

    /// @notice Clears a dispute so the freelancer can resubmit evidence.
    /// @param milestoneId Index of the disputed milestone.
    function resolveDispute(uint256 milestoneId) external onlyClient inStatus(EscrowStatus.Funded) validMilestone(milestoneId) {
        Milestone storage milestone = milestones[milestoneId];
        if (milestone.status != MilestoneStatus.Disputed) revert InvalidMilestoneStatus(milestone.status);

        milestone.status = bytes(milestone.evidence).length == 0
            ? MilestoneStatus.Pending
            : MilestoneStatus.EvidenceSubmitted;

        emit MilestoneDisputeResolved(milestoneId, msg.sender);
    }

    /// @notice Cancels an incomplete escrow and refunds all unreleased funds to the client.
    /// @dev Already released milestone funds stay with the freelancer.
    function cancel() external onlyClient nonReentrant {
        if (status != EscrowStatus.Created && status != EscrowStatus.Funded) {
            revert EscrowNotCancellable(status);
        }

        status = EscrowStatus.Cancelled;
        uint256 refundAmount = address(this).balance;

        if (refundAmount > 0) {
            _sendValue(client, refundAmount);
        }

        emit EscrowCancelled(msg.sender, refundAmount);
    }

    /// @notice Returns one milestone.
    function getMilestone(uint256 milestoneId) external view validMilestone(milestoneId) returns (Milestone memory) {
        return milestones[milestoneId];
    }

    /// @notice Returns all milestones.
    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    /// @notice Returns the number of configured milestones.
    function milestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    /// @notice Returns funds still held by this escrow.
    function remainingBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function _releaseMilestone(uint256 milestoneId, Milestone storage milestone) private {
        milestone.status = MilestoneStatus.Released;
        milestone.releasedAt = uint64(block.timestamp);
        releasedAmount += milestone.amount;
        releasedMilestoneCount++;

        _sendValue(freelancer, milestone.amount);
        emit MilestoneReleased(milestoneId, freelancer, milestone.amount);

        if (releasedMilestoneCount == milestones.length) {
            status = EscrowStatus.Completed;
            emit EscrowCompleted(releasedAmount);
        }
    }

    function _sendValue(address recipient, uint256 amount) private {
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}
