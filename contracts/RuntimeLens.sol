// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RuntimeLens {
    function codeSize(address target) public view returns (uint256 size) {
        assembly {
            size := extcodesize(target)
        }
    }

    function hasBytecode(address target) external view returns (bool) {
        return codeSize(target) > 0;
    }

    function batchCodeSize(address[] calldata targets) external view returns (uint256[] memory out) {
        out = new uint256[](targets.length);
        for (uint256 i = 0; i < targets.length; i++) {
            out[i] = codeSize(targets[i]);
        }
    }
}
