// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AddressLedger {
    struct Entry {
        bytes32 label;
        uint64 createdAt;
        address creator;
    }

    mapping(address => Entry) private entries;

    event Labeled(address indexed target, bytes32 indexed label, address indexed creator, uint64 createdAt);

    function setLabel(address target, bytes32 label) external {
        require(target != address(0), "zero target");
        entries[target] = Entry({
            label: label,
            createdAt: uint64(block.timestamp),
            creator: msg.sender
        });
        emit Labeled(target, label, msg.sender, uint64(block.timestamp));
    }

    function getLabel(address target) external view returns (bytes32 label, uint64 createdAt, address creator) {
        Entry memory e = entries[target];
        return (e.label, e.createdAt, e.creator);
    }

    function hasLabel(address target) external view returns (bool) {
        return entries[target].createdAt != 0;
    }
}
