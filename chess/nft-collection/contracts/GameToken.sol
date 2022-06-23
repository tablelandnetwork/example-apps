// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

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
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        Game storage game = _games[tokenId];
        game.player1 = player1;
        game.player2 = player2;
        game.balance = 0;

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

    function setBounty(uint256 tokenId)
        public
        payable
    {
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");
        require(msg.value > 0, "bounty must be greater than zero");

        _games[tokenId].balance = _games[tokenId].balance + msg.value;
    }

    function condede(uint256 tokenId)
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
        }

        if (_games[tokenId].player2 == msg.sender) {
            _games[tokenId].winner = payable(_games[tokenId].player1);
        }
    }

    function setWinner(uint256 tokenId, address payable winner)
        public
    {
        require(ownerOf(tokenId) == msg.sender, "sender must be owner");
        require(_games[tokenId].player1 > address(0), "game does not exist");
        require(_games[tokenId].player2 > address(0), "game does not exist");

        require(
            _games[tokenId].player1 == winner || _games[tokenId].player2 == winner,
            "winner must be a player"
        );

        _games[tokenId].winner = winner;
        uint balance = _games[tokenId].balance;
        _games[tokenId].balance = 0;

        if (balance > 0) {
            // TODO: there is a potential security risk here if winner is a contract
            (bool paid, ) = winner.call{value: balance}("");
            if (!paid) {
                _games[tokenId].balance = balance;
            }
        }
    }

}
