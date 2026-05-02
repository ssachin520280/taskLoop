// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EscrowFactory} from "../src/EscrowFactory.sol";

interface Vm {
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract Deploy {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (EscrowFactory) {
        vm.startBroadcast();
        EscrowFactory escrowFactory = new EscrowFactory();
        vm.stopBroadcast();
        return escrowFactory;
    }
}
