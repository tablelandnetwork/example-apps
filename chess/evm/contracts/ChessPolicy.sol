//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandController.sol";
import "./ChessToken.sol";
import "./ChessTableland.sol";


interface IChessToken {
    function getPlayerGames(address player) external view returns (uint256[] memory);
}

contract ChessPolicy is ITablelandController {
    IChessToken private chessToken;

    constructor(address _chessTokenAddr) {
        chessToken = IChessToken(_chessTokenAddr);
    }

    function getPolicy(address caller)
        public
        payable
        override
        returns(ITablelandController.Policy memory)
    {
        uint256[] memory playerGames = chessToken.getPlayerGames(caller);

        string memory wc;
        string[] memory uc;

        // If they are not a player in a game they have no access
        if (playerGames.length == 0) {
            return ITablelandController.Policy({
                allowInsert: false,
                allowUpdate: false,
                allowDelete: false,
                whereClause: wc,
                withCheck: wc,
                updatableColumns: uc
            });
        }

        // if they are a player they can only insert rows with game_id equal to one of there games
        return ITablelandController.Policy({
            allowInsert: true,
            allowUpdate: false,
            allowDelete: false,
            whereClause: string.concat(
                "player_address = ",
                ChessTableland._addressToString(caller),
                " AND game_id IN (",
                _gamesToString(playerGames),
                ")"
            ),
            withCheck: wc,
            updatableColumns: uc
        });
    }

    function _gamesToString(uint256[] memory games) internal pure returns (string memory) {
        string memory gamesString = "";
        for (uint i = 0; i < games.length; i++) {
            if (i + 1 < games.length) {
                gamesString = string.concat(gamesString, "'", Strings.toString(games[i]), "', ");
            } else {
                gamesString = string.concat(gamesString, "'", Strings.toString(games[i]), "'");
            }
        }

        return gamesString;
    }

}
