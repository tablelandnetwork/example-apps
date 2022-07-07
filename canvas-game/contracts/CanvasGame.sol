// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/TablelandDeployments.sol";

contract CanvasGame is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    ITablelandTables private _tableland;

    string private _baseURIString = "https://testnet.tableland.network/query?s=";
    string private _projectTable;
    uint256 private _projectTableId;
    string private _metadataTable;
    uint256 private _metadataTableId;
    string private _tablePrefix = "canvas";
    // someday we update this with a nuxt app that diplays x,y and 
    // gives you the interface to move x,y.
    string private _externalURL = "not.implemented.com";


    constructor(
      string memory projectName,
      string memory projectDescription,
      string memory projectImage,
      string memory projectLink
    ) ERC721("GameItem", "ITM") {
      // Connect to the Tableland network
      _tableland = TablelandDeployments.get();
      /*
        CREATE TABLE prefix_meta_chainId (int id, string name, string description, string external_link, int x, int y);
      */
      _metadataTableId = _tableland.createTable(
        address(this),
        string.concat(
          "create table ",
          _tablePrefix,
          "_meta_",
          Strings.toString(block.chainid),
          " (int id, string external_link, int x, int y);"
        )
      );

      _metadataTable = string.concat(
        _tablePrefix,
        "_meta_",
        Strings.toString(block.chainid),
        "_",
        Strings.toString(_metadataTableId)
      );


      /*
      * CREATE TABLE prefix_chainId 
      * (string name, string description, string image, string metadata, string address);
      * 
      * name, description, image all provided on deploy
      * metadata created above
      * address is this contract
      */
      _projectTableId = _tableland.createTable(
        address(this),
        string.concat(
          "create table ",
          _tablePrefix,
          "_",
          Strings.toString(block.chainid),
          " (string name, string description, string image, string external_link, string metadata, string address);"
        )
      );

      _projectTable = string.concat(
        _tablePrefix,
        "_",
        Strings.toString(block.chainid),
        "_",
        Strings.toString(_projectTableId)
      );

      _tableland.runSQL(
        address(this),
        _projectTableId,
        string.concat(
          "insert into ",
          _projectTable,
          " (name, description, image, external_link, metadata, address) values (",
          projectName, ",",
          projectDescription, ",",
          projectImage, ",",
          projectLink, ",",
          _metadataTable, ",",
          _addressToString(address(this)),
          ")"
        )
      );

    }

    /*
    * safeMint allows anyone to mint a token in this project. 
    * Any time a token is minted, a new row of metadata will be
    * dynamically insterted into the metadata table.
    */
    function safeMint(address to) public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _tableland.runSQL(
          address(this),
          _metadataTableId,
          string.concat(
            "insert into ",
            _metadataTable,
            " (id, external_link, x, y) values (",
            Strings.toString(newItemId),
            ", '",
            _externalURL,
            "', 0, 0)"
          )
        );
        _safeMint(to, newItemId, "");
        _tokenIds.increment();
        return newItemId;
    }

    /*
    * makeMove is an example of how to encode gameplay into both the
    * smart contract and the metadata. Whenever a token owner calls
    * make move, they can supply a new x,y coordinate and update
    * their token's metadata.
    */
    function makeMove(uint256 tokenId, uint256 x, uint256 y) public {
      // check token ownership
      require(this.ownerOf(tokenId) == msg.sender, "Invalid owner");
      // simple on-chain gameplay enforcement
      require(x < 512 && 0 <= x, "Out of bounds");
      require(y < 512 && 0 <= y, "Out of bounds");
      // Update the row in tableland
      _tableland.runSQL(
        address(this),
        _metadataTableId,
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

    /*
    * tokenURI is an example of how to turn a row in your table back into 
    * erc721 compliant metadata JSON. here, we do a simple SELECT statement
    * with function that converts the result into json.
    */
    function tokenURI(uint256 tokenId)
      public
      view
      virtual
      override
      returns (string memory)
    {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory base = _baseURI();

        string memory json_group = "";
        string[4] memory cols = ["id", "external_link", "x", "y"];
        for (uint i; i < cols.length; i++) {
          if (i > 0) {
            json_group = string.concat(json_group,",");
          }
          json_group = string.concat(
            json_group, 
            "'",
            cols[i],
            "',",
            cols[i]
          );
        }

        return string.concat(
          base, 
          "SELECT%20",
          json_group,
          "%20FROM%20",
          _metadataTable,
          "%20WHERE%20id%3D",
          Strings.toString(tokenId),
          "&mode=list"
        );
    }

    /*
    * contractURI returns the project table metadata for the whole project
    */
    function contractURI() public view returns (string memory) {
        string memory base = _baseURI();

        string memory json_group = "";
        string[6] memory cols = ["name", "description", "image", "external_link", "metadata", "address"];
        for (uint i; i < cols.length; i++) {
          if (i > 0) {
            json_group = string.concat(json_group,",");
          }
          json_group = string.concat(
            json_group, 
            "'",
            cols[i],
            "',",
            cols[i]
          );
        }

        return string.concat(
          base, 
          "SELECT%20json_object(",
          json_group,
          ")%20FROM%20",
          _projectTable,
          "&mode=list"
        );
    }

    /*
    * setExternalURL provides an example of how to update a field for every
    * row in an table. 
    */
    function setExternalURL(string calldata externalURL) external onlyOwner() {
      _externalURL = externalURL;
      _tableland.runSQL(
        address(this),
        _metadataTableId,
        string.concat(
          "update ",
          _metadataTable,
          " set external_link = ",
          externalURL,
          "||'?tokenId='||id", // Turns every row's URL into a URL including get param for tokenId 
          ";"
        )
      );
    }

    function _addressToString(address x) internal pure returns (string memory) {
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
