// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@tableland/evm/contracts/utils/URITemplate.sol";
import "./ChessTableland.sol";

contract ChessToken is ERC721Enumerable, ERC721Holder, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    string private _baseURIString;
    TablelandData internal _tablelandData;
    address internal _deployedBy;

    // data will be kept in tableland, this is used to track bounties and enable on chain ACL
    struct Game {
        address player1;
        address player2;
        address payable winner;
        uint256 bounty;
    }

    mapping(uint256 => Game) private _games;

    // The Policy Contract uses this information to enforce ACL
    mapping(address => uint256[]) private _playerGames;

    constructor(string memory baseURI, address registry, string memory appURI) ERC721("ChessToken", "MTK") {
        _baseURIString = baseURI;
        _deployedBy = msg.sender;
        ChessTableland._initTableland(_tablelandData, registry);

        // NOTE: you can only set the appURI during deploy
        // The app should be hosted on IPFS and pinned somehow
        ChessTableland._setAnimationBaseURI(_tablelandData, appURI);
    }

    /*
     *  Create a tables to store metadata and moves for the Chess Token
     */
    function initCreate() external onlyOwner() {
        ChessTableland._initCreateTables(_tablelandData);
    }

    /*
     *  Set the Policy Controller contract that will enforce
     *  Tableland ACL rules for the Chess Moves Table
     */
    function initSetController(address policyAddress) external onlyOwner() {
        ChessTableland._initSetController(_tablelandData, policyAddress);
    }

    // You can use these functions to figure out what
    // the names of your tables are after deploying
    function getMetadataTableId() public view returns(uint256) {
        return _tablelandData._metadataTableId;
    }
    function getAttributesTableId() public view returns(uint256) {
        return _tablelandData._attributesTableId;
    }
    function getMovesTableId() public view returns(uint256) {
        return _tablelandData._movesTableId;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        return ChessTableland._getMetadataURI(_tablelandData, tokenId, _baseURI());
    }

    function setBaseURI(string memory baseURI) public {
        require(msg.sender == _deployedBy, "only the address that deployed the contract can call");

        _baseURIString = baseURI;
    } 

    function setAppBaseURI(string memory appURI) public {
        require(msg.sender == _deployedBy, "only the address that deployed the contract can call");

        ChessTableland._setAnimationBaseURI(_tablelandData, appURI);
    } 

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIString;
    }

    function mintGame(address to, address player1, address player2)
        public
        returns (uint256)
    {
        require(player1 != player2, "players cannot share an address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        // We are going to leave this to track bounties
        Game storage game = _games[tokenId];
        game.player1 = player1;
        game.player2 = player2;
        game.bounty = 0;

        // This is used by the Policy contract to determine if insert is allowed
        _playerGames[player1].push(tokenId);
        _playerGames[player2].push(tokenId);

        // insert Tableland row of metadata
        ChessTableland._insertGame(_tablelandData, tokenId, player1, player2);

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

        ChessTableland._setBounty(_tablelandData, tokenId, _games[tokenId].bounty);
    }

    function concede(uint256 tokenId)
        public
    {
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");
        require(_games[tokenId].winner == address(0), "game already has a winner");
        require(
            _games[tokenId].player1 == msg.sender || _games[tokenId].player2 == msg.sender,
            "sender must be a player"
        );

        ChessTableland._concede(_tablelandData, tokenId);

        _deactivatePlayerGame(tokenId, _games[tokenId].player1);
        _deactivatePlayerGame(tokenId, _games[tokenId].player2);

        if (_games[tokenId].player1 == msg.sender) {
            _games[tokenId].winner = payable(_games[tokenId].player2);
        }

        if (_games[tokenId].player2 == msg.sender) {
            _games[tokenId].winner = payable(_games[tokenId].player1);
        }
    }

    function setWinner(uint256 tokenId, address winner)
        public
    {
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");
        require(ownerOf(tokenId) == msg.sender, "sender must be owner of game");
        require(_games[tokenId].winner == address(0), "game already has a winner");
        require(
            _games[tokenId].player1 == winner || _games[tokenId].player2 == winner,
            "winner must be a player"
        );

        ChessTableland._setWinner(_tablelandData, tokenId, winner);

        _deactivatePlayerGame(tokenId, _games[tokenId].player1);
        _deactivatePlayerGame(tokenId, _games[tokenId].player2);

        _games[tokenId].winner = payable(winner);
    }

    // use the pattern where the winner claims the bounty
    function claimBounty(uint256 tokenId)
        public
    {
        require(_games[tokenId].winner != address(0), "cannot payout until there is a winner");
        require(_games[tokenId].winner == payable(msg.sender), "cannot claim unless you are the payable(winner)");
        require(_games[tokenId].bounty > 0, "there is no bounty for this game");

        uint256 bounty = _games[tokenId].bounty;
        // set zero first to avoid reentrancy
        _games[tokenId].bounty = 0;
        payable(msg.sender).transfer(bounty);
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
}
