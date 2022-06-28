// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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
        baseURI = "http://localhost:8080/query?mode=list&s=";
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory player1 = _addressToString(_games[tokenId].player1);
        string memory player2 = _addressToString(_games[tokenId].player2);
        string memory tokenString = Strings.toString(tokenId);

        return bytes(baseURI).length > 0 ?
            string(
                abi.encodePacked(
                    baseURI,
                    "select%20json_build_object('name',concat('#',id),'external_url',concat('https://localhost:3000?game=',id,'&black=",
                    player2,
                    "&white=",
                    player1,
                    "'),'animation_url',concat('https://localhost:3000?game=',id,'&black=",
                    player2,
                    "&white=",
                    player1,
                    "&animate=true'),'image',image,'attributes',json_agg(json_build_object('trait_type','player1','value',",
                    player1,
                    "),json_build_object('trait_type','player2','value',",
                    player2,
                    ")))%20from%20chess_31337_2%20where%20id%20=%20",
                    tokenString,
                    ";"
                )
            ) :
            "";
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
