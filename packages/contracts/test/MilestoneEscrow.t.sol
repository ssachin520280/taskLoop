// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EscrowFactory} from "../src/EscrowFactory.sol";
import {MilestoneEscrow} from "../src/MilestoneEscrow.sol";

contract ClientActor {
    receive() external payable {}

    function createEscrow(
        EscrowFactory factory,
        address freelancer,
        MilestoneEscrow.MilestoneInput[] calldata milestones
    ) external returns (address) {
        return factory.createEscrow(freelancer, milestones);
    }

    function fund(MilestoneEscrow escrow) external payable {
        escrow.fund{value: msg.value}();
    }

    function approve(MilestoneEscrow escrow, uint256 milestoneId) external {
        escrow.approveMilestone(milestoneId);
    }

    function dispute(MilestoneEscrow escrow, uint256 milestoneId, string calldata reason) external {
        escrow.disputeMilestone(milestoneId, reason);
    }

    function cancel(MilestoneEscrow escrow) external {
        escrow.cancel();
    }
}

contract FreelancerActor {
    receive() external payable {}

    function submitEvidence(MilestoneEscrow escrow, uint256 milestoneId, string calldata evidence) external {
        escrow.submitEvidence(milestoneId, evidence);
    }

    function dispute(MilestoneEscrow escrow, uint256 milestoneId, string calldata reason) external {
        escrow.disputeMilestone(milestoneId, reason);
    }
}

contract MilestoneEscrowTest {
    uint256 private constant FIRST_AMOUNT = 1 ether;
    uint256 private constant SECOND_AMOUNT = 2 ether;
    uint256 private constant TOTAL_AMOUNT = FIRST_AMOUNT + SECOND_AMOUNT;

    EscrowFactory private factory;
    ClientActor private client;
    FreelancerActor private freelancer;

    function testCreateEscrow() public {
        MilestoneEscrow escrow = _createEscrow();

        require(factory.escrowCount() == 1, "factory count");
        require(factory.isTaskLoopEscrow(address(escrow)), "factory marker");
        require(escrow.client() == address(client), "client");
        require(escrow.freelancer() == address(freelancer), "freelancer");
        require(escrow.totalAmount() == TOTAL_AMOUNT, "total");
        require(escrow.milestoneCount() == 2, "milestone count");
        require(uint256(escrow.status()) == uint256(MilestoneEscrow.EscrowStatus.Created), "status");

        EscrowFactory.EscrowRecord memory record = factory.getEscrow(0);
        require(record.escrow == address(escrow), "record escrow");
        require(record.totalAmount == TOTAL_AMOUNT, "record total");
    }

    function testFundEscrow() public {
        MilestoneEscrow escrow = _createEscrow();

        client.fund{value: TOTAL_AMOUNT}(escrow);

        require(uint256(escrow.status()) == uint256(MilestoneEscrow.EscrowStatus.Funded), "status");
        require(address(escrow).balance == TOTAL_AMOUNT, "escrow balance");
        require(escrow.remainingBalance() == TOTAL_AMOUNT, "remaining");
    }

    function testSubmitEvidence() public {
        MilestoneEscrow escrow = _createFundedEscrow();

        freelancer.submitEvidence(escrow, 0, "ipfs://evidence-1");
        MilestoneEscrow.Milestone memory milestone = escrow.getMilestone(0);

        require(uint256(milestone.status) == uint256(MilestoneEscrow.MilestoneStatus.EvidenceSubmitted), "status");
        require(_sameString(milestone.evidence, "ipfs://evidence-1"), "evidence");
        require(milestone.submittedAt > 0, "submitted at");
    }

    function testApproveAndReleaseMilestone() public {
        MilestoneEscrow escrow = _createFundedEscrow();
        uint256 freelancerBalanceBefore = address(freelancer).balance;

        freelancer.submitEvidence(escrow, 0, "sha256:first-result");
        client.approve(escrow, 0);

        MilestoneEscrow.Milestone memory milestone = escrow.getMilestone(0);
        require(uint256(milestone.status) == uint256(MilestoneEscrow.MilestoneStatus.Released), "status");
        require(milestone.approvedAt > 0, "approved at");
        require(milestone.releasedAt > 0, "released at");
        require(escrow.releasedAmount() == FIRST_AMOUNT, "released amount");
        require(address(escrow).balance == SECOND_AMOUNT, "remaining escrow balance");
        require(address(freelancer).balance == freelancerBalanceBefore + FIRST_AMOUNT, "freelancer paid");
        require(uint256(escrow.status()) == uint256(MilestoneEscrow.EscrowStatus.Funded), "escrow remains funded");
    }

    function testDisputeMilestone() public {
        MilestoneEscrow escrow = _createFundedEscrow();

        freelancer.submitEvidence(escrow, 0, "ipfs://draft");
        client.dispute(escrow, 0, "Evidence does not match scope");

        MilestoneEscrow.Milestone memory milestone = escrow.getMilestone(0);
        require(uint256(milestone.status) == uint256(MilestoneEscrow.MilestoneStatus.Disputed), "status");
    }

    function testCancellationRefundPath() public {
        MilestoneEscrow escrow = _createFundedEscrow();
        uint256 clientBalanceBefore = address(client).balance;
        uint256 freelancerBalanceBefore = address(freelancer).balance;

        freelancer.submitEvidence(escrow, 0, "ipfs://complete-first");
        client.approve(escrow, 0);
        client.cancel(escrow);

        require(uint256(escrow.status()) == uint256(MilestoneEscrow.EscrowStatus.Cancelled), "status");
        require(address(escrow).balance == 0, "escrow balance");
        require(address(client).balance == clientBalanceBefore + SECOND_AMOUNT, "client refund");
        require(address(freelancer).balance == freelancerBalanceBefore + FIRST_AMOUNT, "freelancer keeps released");
    }

    function _createFundedEscrow() private returns (MilestoneEscrow escrow) {
        escrow = _createEscrow();
        client.fund{value: TOTAL_AMOUNT}(escrow);
    }

    function _createEscrow() private returns (MilestoneEscrow) {
        _setUpActors();
        MilestoneEscrow.MilestoneInput[] memory milestones = _milestones();
        address escrow = client.createEscrow(factory, address(freelancer), milestones);

        return MilestoneEscrow(payable(escrow));
    }

    function _setUpActors() private {
        factory = new EscrowFactory();
        client = new ClientActor();
        freelancer = new FreelancerActor();
    }

    function _milestones() private pure returns (MilestoneEscrow.MilestoneInput[] memory milestones) {
        milestones = new MilestoneEscrow.MilestoneInput[](2);
        milestones[0] = MilestoneEscrow.MilestoneInput({title: "Design proof", amount: FIRST_AMOUNT});
        milestones[1] = MilestoneEscrow.MilestoneInput({title: "Final delivery", amount: SECOND_AMOUNT});
    }

    function _sameString(string memory left, string memory right) private pure returns (bool) {
        return keccak256(bytes(left)) == keccak256(bytes(right));
    }
}
