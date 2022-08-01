// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/URITemplate.sol";


contract ChessToken is ERC721, ERC721Holder, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    ITablelandTables private _tableland;
    uint256 private _metadataTableId = 0;
    uint256 private _movesTableId = 0;
    string private _baseURIString;
    string private _metadataTable;
    string private _movesTable;

    // TODO: data will be kept in tableland, but leave this to
    //       track bounties
    struct Game {
        address player1;
        address player2;
        address payable winner;
        uint256 bounty;
    }

    mapping(uint256 => Game) private _games;

    // The Policy Contract uses this information to enforce ACL
    mapping(address => uint256[]) private _playerGames;

    constructor(string memory baseURI, address registry) ERC721("ChessToken", "MTK") {
        _baseURIString = baseURI;
        _tableland = ITablelandTables(registry);
    }

    /*
     *  Create a table to store metadata for the Chess Token
     */
    function initCreateMetadata() external onlyOwner() {
        require(_metadataTableId == 0, "Chess Token table already exists");

        string memory prefix = "chess_token_";
        _metadataTableId = _tableland.createTable(
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

        _metadataTable = string.concat(
            prefix,
            Strings.toString(block.chainid),
            Strings.toString(_metadataTableId)
        );
    }

    /*
     *  Create a table to store the moves of the Chess games,
     *  which are the content that makes up the chess tokens
     */
    function initCreateMoves() external onlyOwner() {
        require(_movesTableId == 0, "Chess Moves table already exists");

        string memory prefix = "chess_moves_";
        _movesTableId = _tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                prefix,
                Strings.toString(block.chainid),
                "(player_address TEXT,",
                "game_id INT,",
                "move_id INT PRIMARY KEY AUTOINCREMENT,",
                "move TEXT);"
            )
        );

        _movesTable = string.concat(
            prefix,
            Strings.toString(block.chainid),
            Strings.toString(_movesTableId)
        );
    }

    /*
     *  Set the Policy Controller contract that will enforce
     *  Tableland ACL rules for the Chess Moves Table
     */
    function initSetController(address policyAddress) external onlyOwner() {
        require(_movesTableId > 0, "Chess Moves table does not exist");
        require(
            _tableland.getController(_movesTableId) == 0x0000000000000000000000000000000000000000,
            "Controller already set"
        );

        _tableland.setController(address(this), _movesTableId, policyAddress);
    }

    function getMetadataTableId() public view returns(uint256) {
        return _metadataTableId;
    }

    function getMovesTableId() public view returns(uint256) {
        return _movesTableId;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return string.concat(
            _baseURI(),
            "SELECT * FROM ",
            _metadataTable,
            " WHERE id = '",
            Strings.toString(tokenId),
            "'&mode=list"
        );
    }

    function mintGame(address to, address player1, address player2)
        public
        returns (uint256)
    {
        require(player1 != player2, "players cannot share an address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        // TODO: insert Tableland row of metadata

        // We are going to leave this to track bounties
        Game storage game = _games[tokenId];
        game.player1 = player1;
        game.player2 = player2;
        game.bounty = 0;

        // This is used by the Policy contract to determine if insert is allowed
        _playerGames[player1].push(tokenId);
        _playerGames[player2].push(tokenId);

        return tokenId;
    }

    // this function can be used to get the players and bounty of a game
    function getGame(uint256 tokenId)
        public
        view
        returns (Game memory)
    {
        Game memory game = _games[tokenId];

        require(game.player1 > address(0), "game does not exist");
        require(game.player2 > address(0), "game does not exist");

        return game;
    }

    // this function is used by the Policy Contract to construct a Tableland Policy
    function getPlayerGames(address player) 
        public
        view
        returns (uint256[] memory)
    {
        return _playerGames[player];
    }

    function setBounty(uint256 tokenId)
        public
        payable
    {
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");
        require(_games[tokenId].winner == address(0), "game has ended");
        require(msg.value > 0, "bounty must be greater than zero");
        require(ownerOf(tokenId) != _games[tokenId].player1, "owner is a player");
        require(ownerOf(tokenId) != _games[tokenId].player2, "owner is a player");

        _games[tokenId].bounty = _games[tokenId].bounty + msg.value;
    }

    function concede(uint256 tokenId)
        public
    {
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");
        require(
            _games[tokenId].player1 == msg.sender || _games[tokenId].player2 == msg.sender,
            "sender must be a player"
        );

        if (_games[tokenId].player1 == msg.sender) {
            _games[tokenId].winner = payable(_games[tokenId].player2);
            _payWinner(tokenId);
        }

        if (_games[tokenId].player2 == msg.sender) {
            _games[tokenId].winner = payable(_games[tokenId].player1);
            _payWinner(tokenId);
        }
    }

    function setWinner(uint256 tokenId, address payable winner)
        public
    {
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");
        require(ownerOf(tokenId) == msg.sender, "sender must be owner");

        require(
            _games[tokenId].player1 == winner || _games[tokenId].player2 == winner,
            "winner must be a player"
        );

        _games[tokenId].winner = winner;

        _deactivatePlayerGame(tokenId, _games[tokenId].player1);
        _deactivatePlayerGame(tokenId, _games[tokenId].player2);

        _payWinner(tokenId);
    }

    // Remove the `tokenId` game from this player's list of games
    function _deactivatePlayerGame(uint256 tokenId, address player)
        private
    {
        // check that the player is in this game first
        if (!_playerInGame(tokenId, player)) return;

        // Get the length of the _playerGames uint256 after we remove the `tikenId` game
        // so that we can create a new list in memory. Note: Solidity doesn't let us dynamically
        // size arrays in memory.
        uint newGameLength = _getPlayerGameCount(player) - 1;
        uint256[] memory playerGames = new uint256[](newGameLength);

        // Loop through the existing games and put all but tokenId into the new array
        uint256 nextInsert = 0;
        for (uint256 i = 0; i < _playerGames[player].length; i++) {
            if (_playerGames[player][i] >= 0 && _playerGames[player][i] != tokenId) {
                // Note: push is not allowed in this context, so we manage position with `nextInsert`
                playerGames[nextInsert] = _playerGames[player][i];
                nextInsert++;
            }
        }

        // replace the old array with the new filtered array
        _playerGames[player] = playerGames;
    }

    function _playerInGame(uint256 tokenId, address player)
        private
        view
        returns (bool)
    {
        for (uint256 i = 0; i < _playerGames[player].length; i++) {
            if (_playerGames[player][i] >= 0 && _playerGames[player][i] == tokenId) {
                return true;
            }
        }

        return false;
    }

    function _getPlayerGameCount(address player)
        private
        view
            returns (uint)
    {
        return _playerGames[player].length;
    }

    function _payWinner(uint256 tokenId)
        private
    {
        require(_games[tokenId].winner != address(0), "cannot payout until there is a winner");
        uint bounty = _games[tokenId].bounty;
        _games[tokenId].bounty = 0;

        if (bounty > 0) {
            // TODO: there is a potential security risk here if winner is a contract. Using send
            //       and transfer aren't recommended because of gas cost and changes in Istanbul
            (bool paid, ) = _games[tokenId].winner.call{value: bounty}("");
            if (!paid) {
                _games[tokenId].bounty = bounty;
            }
        }
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
