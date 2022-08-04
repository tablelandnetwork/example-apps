// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct TablelandData {
    ITablelandTables _tableland;
    uint256 _metadataTableId;
    uint256 _movesTableId;
    string _metadataTable;
    string _movesTable;
}

library ChessTableland {

    function _initTableland(TablelandData storage self, address registry) public {
        self._tableland = ITablelandTables(registry);
    }
    /*
     *  Create a table to store metadata for the Chess Token
     */
    function _initCreateMetadata(TablelandData storage self) public {
        require(self._metadataTableId == 0, "Chess Token table already exists");

        string memory prefix = "chess_token_";
        self._metadataTableId = self._tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                prefix,
                Strings.toString(block.chainid),
                " (id int,",
                " player1 text,",
                " player2 text,",
                " conceeded int,",
                " winner text,",
                " bounty real);"
            )
        );

        self._metadataTable = string.concat(
            prefix,
            Strings.toString(block.chainid),
            Strings.toString(self._metadataTableId)
        );
    }

    /*
     *  Create a table to store the moves of the Chess games,
     *  which are the content that makes up the chess tokens
     */
    function _initCreateMoves(TablelandData storage self) public {
        require(self._movesTableId == 0, "Chess Moves table already exists");

        string memory prefix = "chess_moves_";
        self._movesTableId = self._tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                prefix,
                Strings.toString(block.chainid),
                "(player_address TEXT,",
                "game_id INT,",
                "move TEXT);"
            )
        );

        self._movesTable = string.concat(
            prefix,
            Strings.toString(block.chainid),
            Strings.toString(self._movesTableId)
        );
    }

    /*
     *  Set the Policy Controller contract that will enforce
     *  Tableland ACL rules for the Chess Moves Table
     */
    function _initSetController(TablelandData storage self, address policyAddress) public {
        require(self._movesTableId > 0, "Chess Moves table does not exist");
        require(
            self._tableland.getController(self._movesTableId) == 0x0000000000000000000000000000000000000000,
            "Controller already set"
        );

        self._tableland.setController(address(this), self._movesTableId, policyAddress);
        self._tableland.lockController(address(this), self._movesTableId);
    }

    function _insertGame(TablelandData storage self, uint256 tokenId, address player1, address player2) public {
        self._tableland.runSQL(address(this), self._metadataTableId, string.concat(
            "INSERT INTO ",
            self._metadataTable,
            " (id, player1, player2, bounty) VALUES (",
            Strings.toString(tokenId),
            ",",
            _addressToString(player1),
            ",",
            _addressToString(player2),
            ",",
            "0);"
        ));
    }

    function _setBounty(TablelandData storage self, uint256 tokenId, uint256 bounty) public {
        self._tableland.runSQL(address(this), self._metadataTableId, string.concat(
            "UPDATE ",
            self._metadataTable,
            " SET bounty = ",
            Strings.toString(bounty),
            " WHERE id = ",
            Strings.toString(tokenId),
            ";"
        ));
    }

    function _concede(TablelandData storage self, uint256 tokenId, address winner) public {
        self._tableland.runSQL(address(this), self._metadataTableId, string.concat(
            "UPDATE ",
            self._metadataTable,
            " SET conceeded = 1, winner = ",
            _addressToString(winner),
            " WHERE id = ",
            Strings.toString(tokenId),
            ";"
        ));
    }

    function _setWinner(TablelandData storage self, uint256 tokenId, address winner) public {
        self._tableland.runSQL(address(this), self._metadataTableId, string.concat(
            "UPDATE ",
            self._metadataTable,
            " SET winner = ",
            _addressToString(winner),
            " WHERE id = ",
            Strings.toString(tokenId),
            ";"
        ));
    }

    function _getMetadataURI(TablelandData storage self, uint256 tokenId, string memory baseURI) public view returns(string memory) {
        return string.concat(
            baseURI,
            "SELECT * FROM ",
            self._metadataTable,
            " WHERE id = '",
            Strings.toString(tokenId),
            "'&mode=json"
        );
    }

    function _addressToString(address x) public pure returns (string memory) {
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

    function char(bytes1 b) public pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
