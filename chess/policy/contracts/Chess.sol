//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "hardhat/console.sol";
import "./Controller.sol";


contract Chess is TablelandController {

    function getPolicy(address caller) public pure override returns(TablelandControllerLibrary.Policy memory) {
        string[] memory cols;
        TablelandControllerLibrary.Policy memory policy = TablelandControllerLibrary.Policy(
            true,
            false,
            false,

            string.concat('player_address = ', addressToString(caller)),
            '',

            cols
        );

        return policy;
    }

    function addressToString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

}
