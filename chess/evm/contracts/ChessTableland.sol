// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct TablelandData {
    ITablelandTables _tableland;
    uint256 _metadataTableId;
    uint256 _attributesTableId;
    uint256 _movesTableId;
    string _metadataTable;
    string _attributesTable;
    string _movesTable;
    string _animationBaseURI;
}

library ChessTableland {

    function _initTableland(TablelandData storage self, address registry) public {
        self._tableland = ITablelandTables(registry);
    }
    /*
     *  Create a tables to store metadata for the Chess Token
     */
    function _initCreateTables(TablelandData storage self) public {
        require(self._metadataTableId == 0, "Chess Token table already exists");
        require(self._attributesTableId == 0, "Chess Token attributes table already exists");
        require(self._movesTableId == 0, "Chess Moves table already exists");


        /*
         *  CREATE TABLE chess_token_<chainId> (
         *      id INTEGER PRIMARY KEY,
         *      conceded INT,
         *      bounty REAL,
         *      thumb TEXT,
         *      image TEXT,
         *      animation_url TEXT
         *  );
         */
        string memory metadataPrefix = "chess_token_";
        self._metadataTableId = self._tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                metadataPrefix,
                Strings.toString(block.chainid),
                "(",
                " id INTEGER PRIMARY KEY,",
                " conceded INT,",
                " bounty REAL,",
                " thumb TEXT,",
                " image TEXT,",
                " animation_url TEXT",
                ");"
            )
        );

        self._metadataTable = string.concat(
            metadataPrefix,
            Strings.toString(block.chainid),
            "_",
            Strings.toString(self._metadataTableId)
        );

        /*
         *  CREATE TABLE chess_token_attributes_<chainId> (
         *      type TEXT,
         *      value TEXT,
         *      game_id INTEGER,
         *      FOREIGN KEY(game_id) REFERENCES test(id)
         *  );
         */
        string memory attributesPrefix = "chess_token_attributes_";
        self._attributesTableId = self._tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                attributesPrefix,
                Strings.toString(block.chainid),
                " (",
                " type TEXT,",
                " value TEXT,",
                " game_id INTEGER",
                // NOTE: this something like " FOREIGN KEY(game_id) REFERENCES test(id)"
                //       could make sense here, but this is not supported in the Tableland
                //       SQL spec as of Aug. 2022
                ");"
            )
        );

        self._attributesTable = string.concat(
            attributesPrefix,
            Strings.toString(block.chainid),
            "_",
            Strings.toString(self._attributesTableId)
        );

        /*
         *  CREATE TABLE chess_moves_<chainId> (
         *      player_address TEXT,
         *      game_id INT,
         *      move TEXT
         *  );
         */
        string memory movesPrefix = "chess_moves_";
        self._movesTableId = self._tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                movesPrefix,
                Strings.toString(block.chainid),
                "(player_address TEXT,",
                "game_id INT,",
                "move TEXT);"
            )
        );

        /*
         *  Create a table to store the moves of the Chess games,
         *  which are the content that makes up the chess tokens
         */
        self._movesTable = string.concat(
            movesPrefix,
            Strings.toString(block.chainid),
            "_",
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

    /* This makes 4 insert statements across 2 tables. Of note is that since these are all
     * happening in the same block transaction, the validator will do an all or nothing transaction
     * for the materialization of the data in the database they maintain.
     */
    function _insertGame(TablelandData storage self, uint256 tokenId, address player1, address player2) public {
        string memory tokenIdString = Strings.toString(tokenId);
        string memory player1AddressString = _addressToString(player1);
        string memory player2AddressString = _addressToString(player2);
        /*
         * insert a single row for the game's metadata
         */
        self._tableland.runSQL(address(this), self._metadataTableId, string.concat(
            "INSERT INTO ",
            self._metadataTable,
            " (id, conceded, bounty, thumb, image, animation_url) VALUES (",
            tokenIdString, ",",
            "0,0,", // set conceded and bounty to default of 0
            // Default images are on IPFS for thumb and image
            "'ipfs://bafkreifiaqt3pfoir56owfr5ess4b6vhxeytpallik4oacnuyc5abtrjdy',",
            "'ipfs://bafkreifiaqt3pfoir56owfr5ess4b6vhxeytpallik4oacnuyc5abtrjdy',",
            // animation_url
            "'?white=", player1AddressString,
            "&black=", player2AddressString,
            "&game=", tokenIdString,
            "&auto=true'",
            ");"
        ));

        /*
         * insert three rows for the game metadata attributes.
         * Note the `winner` attribute does not exist until the game has a
         * winner set by the owner.
         */
        self._tableland.runSQL(address(this), self._attributesTableId, string.concat(
            _insertAttribute(self._attributesTable, tokenIdString, 'player1', player1AddressString),
            _insertAttribute(self._attributesTable, tokenIdString, 'player2', player2AddressString),
            _insertAttribute(self._attributesTable, tokenIdString, 'bounty', '0')
        ));
    }

    function _setBounty(TablelandData storage self, uint256 tokenId, uint256 bounty) public {
        self._tableland.runSQL(address(this), self._attributesTableId, string.concat(
            "UPDATE ",
            self._attributesTable,
            " SET value = ",
            "'", Strings.toString(bounty), "'",
            " WHERE game_id = ",
            Strings.toString(tokenId),
            " AND type = 'bounty';"
        ));
    }

    function _concede(TablelandData storage self, uint256 tokenId) public {
        self._tableland.runSQL(address(this), self._metadataTableId, string.concat(
            "UPDATE ",
            self._metadataTable,
            " SET conceded = 1",
            " WHERE id = ",
            Strings.toString(tokenId),
            ";"
        ));
    }

    function _setWinner(TablelandData storage self, uint256 tokenId, address winner) public {
        self._tableland.runSQL(address(this), self._attributesTableId, string.concat(
            "INSERT INTO ", self._attributesTable, " (type, value, game_id) VALUES (",
                "'winner',",
                "'", _addressToString(winner), "'", ",",
                Strings.toString(tokenId),
            ");"
        ));
    }

    function _setAnimationBaseURI(TablelandData storage self, string memory baseURI) public {
        self._animationBaseURI = baseURI;
    }

    function _getMetadataURI(TablelandData storage self, uint256 tokenId, string memory baseURI)
        public
        view
        returns(string memory)
    {

        /*
         *  SELECT json_object(
         *      'name','Chess Game '||id,
         *      'external_url','https://github.com/tablelandnetwork/example-apps/chess',
         *      'image',image,
         *      'thumb',thumb,
         *      'animation_url',animation_url,
         *      'attributes',json_group_array(
         *          json_object('trait_type',type,'value',value)
         *      )
         *  )
         *   FROM test JOIN attrs ON test.id = attrs.game_id
         *   WHERE id = <tokenIdString>;
         */
        string memory tokenIdString = Strings.toString(tokenId);
        return string.concat(
            baseURI,
            "SELECT json_object(",
                "'name','Chess Game '||id,",
                "'description','Chess Game '||id,",
                "'external_url','https://github.com/tablelandnetwork/example-apps/chess',",
                "'image',image,",
                "'thumb',thumb,",
                "'animation_url','", self._animationBaseURI, "'||animation_url,",
                "'attributes',json_group_array(",
                    "json_object('trait_type',type,'value',value)",
                ")",
            ")",
            " FROM ", self._metadataTable, " JOIN ", self._attributesTable, " ON ",
            self._metadataTable, ".id = ", self._attributesTable, ".game_id"
            " WHERE id = ", tokenIdString,
            "&mode=list"
        );
    }

    function _insertAttribute(
        string memory tableName,
        string memory gameId,
        string memory attrType,
        string memory value
    )
        internal
        pure
        returns(string memory)
    {
        return string.concat(
            "INSERT INTO ", tableName, " (game_id, type, value) VALUES (",
                gameId, ",",
                "'", attrType, "'", ",",
                "'", value, "'",
            ");"
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
        return string.concat("0x",string(s));
    }

    function char(bytes1 b) public pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
