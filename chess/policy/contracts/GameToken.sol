// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string baseURI;

    struct Game {
        address player1;
        address player2;
        bool condeded;
        address payable winner;
        uint balance;
    }

    mapping(uint256 => Game) private _games;
    mapping(address => uint256[]) private _playerGames;

    constructor() ERC721("GameToken", "MTK") {
        setBaseURI("http://localhost:8080/chain/31337/tables/3/id/");
    }

    function setBaseURI(string memory newURI) public onlyOwner {
        baseURI = newURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function mintGame(address to, address player1, address player2)
        public
        returns (uint256)
    {
        require(player1 != player2, "players cannot share an address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        Game storage game = _games[tokenId];
        game.player1 = player1;
        game.player2 = player2;
        game.balance = 0;

        _playerGames[player1].push(tokenId);
        _playerGames[player2].push(tokenId);

        return tokenId;
    }

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
        require(msg.value > 0, "bounty must be greater than zero");
        require(ownerOf(tokenId) != _games[tokenId].player1, "owner is a player");
        require(ownerOf(tokenId) != _games[tokenId].player2, "owner is a player");

        _games[tokenId].balance = _games[tokenId].balance + msg.value;
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
            console.log("Player Games Length", playerGames.length);
            if (_playerGames[player][i] >= 0 && _playerGames[player][i] != tokenId) {
                console.log("I ", i);
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
        uint balance = _games[tokenId].balance;
        _games[tokenId].balance = 0;

        if (balance > 0) {
            // TODO: there is a potential security risk here if winner is a contract. Using send
            //       and transfer aren't recommended because of gas cost and changes in Istanbul
            (bool paid, ) = _games[tokenId].winner.call{value: balance}("");
            if (!paid) {
                _games[tokenId].balance = balance;
            }
        }
    }

}
