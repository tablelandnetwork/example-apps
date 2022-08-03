import { ethers } from 'ethers';
import { tick } from 'svelte';
import { writable, derived } from 'svelte/store';
import type { Writable } from "svelte/store";
import { connect, ConnectOptions } from '@tableland/sdk';
import { chessToken } from '../evm/artifacts/contracts/ChessToken.sol/ChessToken.json';

// globally unique tablename that all players use
const MOVES_TABLENAME = 'chess_moves_31337_3';
const TOKEN_CONTRACT_ADDRESS = '0x8464135c8F25Da09e49BC8782676a84730C318bC';
const tokenAbi = chessToken.abi;
const TOKEN_TABLENAME = 'chess_token_31337_2';
const moveWaitDiration = 5000;

// TODO: use alchemy to get the games the user owns, and the games the user is actively playing

// TODO: enable minting a game with two players

// TODO: enable adding a bounty to a game

// internals
let _audience, _tableland, _gameId, _address, _opponentAddress, _myColor, _moves, _white, _black;

// RPC responds with rows and columns in separate arrays, this will combine to an array of objects
const parseResponse = function (data: {rows: any[], columns: {name: string}[]}) {
  return data.rows.map((rowArr) => {
    const row = {} as {[key: string]: any};
    for (let i = 0; i < data.columns.length; i++) {
      const key = data.columns[i].name;
      row[key] = rowArr[i];
    }

    return row;
  });
};

export const gameId = writable('');

// We want to make the game id available to the methods in the store.
// afaict Svelte best practices is to have a mutable var in the file's scope that is updated via subscribe.
// This pattern seems a bit smelly to me, something like <writeable>.get() would make more sense but I'm
// new to Svelte. TODO: Maybe there is a better way to do this?
gameId.subscribe(gid => _gameId = gid);

export const myColor = writable('');
myColor.subscribe(color => _myColor = color);

export const myAddress = writable('');
myAddress.subscribe(address => _address = address);

// Flag that tracks if the user is one of the players, or just watching the game
export const audience = writable(false);
audience.subscribe(isAudience => _audience = isAudience);

const { subscribe: movesSubscribe, set: setMoves, update: updateMoves } = writable([]);
movesSubscribe(mvs => _moves = mvs);
export const moves = {
  subscribe: movesSubscribe,
  doMove: async function (move) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');
      if (_audience) return;

      await _tableland.write(sqlStatements.doMove(_gameId, move));

      updateMoves((allMoves): string[] => {
        return allMoves.concat([move]);
      });

      moves.listenForMoves();
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  listenForMoves: function (black = _black, white = _white, forever = false) {
    if (!black || !white) return;
    const intervalId = setInterval(async function () {
      const res = await _tableland.read(sqlStatements.loadGame(_gameId, black, white));

      const game = parseResponse(res);
      if (game.length > _moves.length) {
        // there is a new move, either from the other player or this player on another screen
        if (!forever) clearInterval(intervalId);
        setMoves(game.map(move => move.move));
      }
    }, moveWaitDiration);

    return intervalId;
  }
}

const { subscribe: gamesSubscribe, set: setGames, update: updateGames } = writable([]);
export const games = {
  subscribe: gamesSubscribe,
  mintGame: async function (params) {
    if (!_tableland) throw new Error('you must connect to Tableland before minting');
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, _tableland.signer);

    const ownerAddress = await _tableland.singer.getAddress();
    await tokenContract.mintGame(ownerAddress, params.player1, params.player2);
  },
  // TODO: active games should come from alchemy via `getPlayerGames(address)`, then games stored
  //       in tableland that don't show up in those results are finished and we will want to get
  //       them from the contract via `getGame(game_id)`
  findGames: async function (search) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');

      // TODO: paginate based on search arg
      const res = await _tableland.read(sqlStatements.myMoves());
      const myMoves = parseResponse(res);

      const uniqueGames = myMoves.reduce(function (allGames, game) {
        const exists = allGames.find(game_id => game.game_id === game_id);
        if (exists) {
          return allGames;
        }

        return allGames.concat([game.game_id]);
      }, []);

      const gamesRes = await _tableland.read(sqlStatements.getGames(uniqueGames));

      const allMoves = parseResponse(gamesRes);
      const games = uniqueGames.map(function (game_id) {
        const whiteMove = allMoves.find(g => ~g.move.indexOf('white'));
        const whiteAddress = whiteMove?.player_address;
        const blackMove = allMoves.find(g => ~g.move.indexOf('black'));
        const blackAddress = blackMove?.player_address;

        if (!(whiteAddress && blackAddress)) {
          return;
        }

        return {
          game_id: game_id,
          link: `?game=${game_id}&white=${whiteAddress}&black=${blackAddress}`
        };
      }).filter(g => g);

      setGames(games);
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  loadGame: async function (loadGameId, black, white) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');
      gameId.update(gid => loadGameId);
      await tick();

      const res = await _tableland.read(sqlStatements.loadGame(loadGameId, black, white));

      const game = parseResponse(res);
      setMoves(game.map(move => move.move));

      if (!_audience) {
        const color = getMyColor(game);
        myColor.update(c => color);
      }

      if (_audience) {
        // If the user is in the audience listen forever
        moves.listenForMoves(black, white, true);
      } else if (game.length && game[game.length - 1].player_address === _address) {
        // If this player made the last move, start waiting for the other player to make their move
        moves.listenForMoves(black, white);
      }
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  }
}

const { subscribe: alertsSubscribe, set: setAlerts, update: updateAlerts } = writable([]);
export const alerts = {
  subscribe: alertsSubscribe,
  addAlert: function (message, type) {
    updateAlerts(alerts => alerts.concat([{message, type, id: alerts.length}]));
  },
  clearAlert: function (alert) {
    updateAlerts(alerts => {
      return alerts.filter(lert => {
        if (lert.id !== alert.id) return true;
        return false;
      });
    })
  }
};

const { subscribe: connectedSubscribe, set: setConnected } = writable(false);
export const connected = {
  subscribe: connectedSubscribe
};

export const init = async function (token) {
  try {
    //const connectParams: ConnectOptions = {
      //chain: 'ethereum-goerli'
    //};
    const connectParams: ConnectOptions = {
      chain: 'local-tableland'
    };
    if (token) {
      connectParams.token = {token};
    }

    _tableland = await connect(connectParams);

    if (!token) {
      await _tableland.siwe();
      // TODO: this token being stored in localStorage is not the most secure approach
      //       If you are using this as an example consider making the user sign a new
      //       siwe token each time the page loads, or save it in a secure service of
      //       some kind.
      localStorage.setItem('tableland.token', _tableland.token.token);
    }

    const decodedToken = atob(localStorage.getItem('tableland.token'));

    const message = JSON.parse(decodedToken);
    const addr = ethers.utils.verifyMessage(message.message, message.signature);

    myAddress.update(address => addr);
    setConnected(true);

    const params = new URLSearchParams(location.search);
    _white = params.get('white');
    _black = params.get('black');
    const gameId = params.get('game');

    if (_white && _black && gameId) {
      if (addr === _white || addr === _black) {
        _opponentAddress = _white === addr ? _black : _white;
      } else {
        audience.set(true);
      }

      await games.loadGame(gameId, _black, _white);
    }
  } catch (err) {
    console.log(err);
    alerts.addAlert(err.message, 'error');
  }
};

const getMyColor = function (game) {
  const params = new URLSearchParams(location.search);
  const white = params.get('white');
  const black = params.get('black');
  const gameId = params.get('game');

  if (!game[0]) {
    if (_address === white) return 'white';
    if (_address === black) return 'black';
    audience.set(true);
    return;
  }
  if (game[0].player_address === _address && _address === white) return 'white';
  if ((!game[1] || game[1].player_address === _address) && _address === black) return 'black';

  audience.set(true);
};

const sqlStatements = {
  doMove: (gameId: string, move: string) => `INSERT INTO ${MOVES_TABLENAME} (player_address, game_id, move) VALUES ('${_address}', '${gameId}', '${move}');`,
  myMoves: () => `SELECT * FROM ${MOVES_TABLENAME} WHERE player_address = '${_address}';`,
  loadGame: (game: string, black: string, white: string) => `
    SELECT * FROM ${MOVES_TABLENAME}
    WHERE game_id = '${game}'
      AND (player_address = '${black}' OR player_address = '${white}')
    ORDER BY move_id ASC;
  `,
  getGames: (uniqueGames: string[]) => `
    SELECT * FROM ${MOVES_TABLENAME}
    WHERE game_id IN ('${uniqueGames.join('\',\'')}');
  `
};
