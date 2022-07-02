// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";

contract CanvasGame is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    ITablelandTables private _tableland;

    string private _baseURIString = "https://testnet.tableland.network/query?s=";
    string private _metadataTable;
    uint256 private _tableId;
    string private _tablePrefix = "canvas";
    string private _chainId = "31337";
    // someday we update this with a nuxt app that diplays x,y and 
    // gives you the interface to move x,y.
    string private _externalURL = "not.implemented.com";

    constructor(address registry) ERC721("GameItem", "ITM") {
      _tableland = ITablelandTables(registry);
      // Can you get a table_id back from createTable?
      _tableId = _tableland.createTable(
        address(this),
        string.concat(
          "create table ",
          _tablePrefix,
          "_",
          _chainId,
          " (int id, string name, string description, string external_link, int x, in y);"
        )
      );

      _metadataTable = string.concat(
        _tablePrefix,
        "_",
        _chainId,
        "_",
        Strings.toString(_tableId)
      );

    }

    function safeMint(address to) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _tableland.runSQL(
          address(this),
          _tableId,
          string.concat(
            "insert into ",
            _metadataTable,
            " (id, name, description, external_link, x, y) values (",
            Strings.toString(newItemId),
            ", 'blah', 'blah', '",
            _externalURL,
            "', 0, 0)"
          )
        );
        _safeMint(to, newItemId, "");
        _tokenIds.increment();
        return newItemId;
    }

    function makeMove(uint256 tokenId, uint256 x, uint256 y) public {
      // check token ownership
      require(this.ownerOf(tokenId) == msg.sender, "Invalid owner");
      require(x < 512 && 0 <= x, "Out of bounds");
      require(y < 512 && 0 <= y, "Out of bounds");
      // bobby tables?
      _tableland.runSQL(
        msg.sender,
        _tableId,
        string.concat(
          "update ",
          _metadataTable,
          " set x = ",
          Strings.toString(x),
          " and y = ",
          Strings.toString(y),
          " WHERE id = ",
          Strings.toString(tokenId),
          ";"
        )
      );
    }

    function _baseURI() internal view override returns (string memory) {
      return _baseURIString;
    }

    function tokenURI(uint256 tokenId)
      public
      view
      virtual
      override
      returns (string memory)
    {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory base = _baseURI();

        return string.concat(
          base, 
          "SELECT%20row_to_json(*)%20FROM%20",
          _metadataTable,
          "%20WHERE%20id%3D",
          Strings.toString(tokenId),
          "&mode=list"
        );
    }
}