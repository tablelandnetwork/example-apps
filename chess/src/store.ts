import { ethers, BigNumber } from 'ethers';
import { tick } from 'svelte';
import { writable, derived } from 'svelte/store';
import type { Writable } from "svelte/store";
import { connect, ConnectOptions } from '@tableland/sdk';
import chessToken from '../evm/artifacts/contracts/ChessToken.sol/ChessToken.json';

// globally unique tablename that all players use
const MOVES_TABLENAME = 'chess_moves_31337_3';
const TOKEN_CONTRACT_ADDRESS = '0x71C95911E9a5D330f4D621842EC243EE1343292e';
const tokenAbi = chessToken.abi;
const TOKEN_TABLENAME = 'chess_token_31337_2';
const moveWaitDiration = 5000;

// TODO: use alchemy to get the games the user owns, and the games the user is actively playing

// TODO: enable minting a game with two players

// TODO: enable adding a bounty to a game

// internals
let _audience;
let _tableland;
let _gameId;
let _address;
let _opponentAddress;
let _myColor;
let _moves;
let _white;
let _black;
let _intervalId;

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
export const whiteAddress = writable('');
export const blackAddress = writable('');

// We want to make the game id available to the methods in the store.
// afaict Svelte best practices is to have a mutable var in the file's scope that is updated via subscribe.
// This pattern seems a bit smelly to me, something like <writeable>.get() would make more sense but I'm
// new to Svelte. TODO: Maybe there is a better way to do this?
gameId.subscribe(gid => _gameId = gid);
whiteAddress.subscribe(white => _white = white);
blackAddress.subscribe(black => _black = black);


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
    _intervalId = setInterval(async function () {
      const res = await _tableland.read(sqlStatements.loadGame(_gameId, black, white));

      const game = parseResponse(res);
      if (game.length > _moves.length) {
        // there is a new move, either from the other player or this player on another screen
        if (!forever) clearInterval(_intervalId);
        setMoves(game.map(move => move.move));
      }
    }, moveWaitDiration);

    return _intervalId;
  },
  unlistenForMoves: function () {
    clearInterval(_intervalId);
  }
}

export const ownedGames = writable([]);

const { subscribe: gamesSubscribe, set: setGames, update: updateGames } = writable([]);
// TODO: games needs to be split into games I own and games I am a player in
export const games = {
  subscribe: gamesSubscribe,
  mintGame: async function (params) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before minting');
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, _tableland.signer);

      const ownerAddress = await _tableland.signer.getAddress();
      const tx = await tokenContract.mintGame(ownerAddress, params.player1, params.player2);
      const receipt = await tx.wait();

      const gameId = receipt.events[0].args.tokenId;

      // refresh games now that a new one exists
      await games.findGames();

      return gameId;
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  addBounty: async function (game, amount) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before minting');

      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, _tableland.signer);

      const tx = await tokenContract.setBounty(
        BigNumber.from(game.id),
        {
          value: ethers.utils.parseEther(amount)
        }
      );
      const receipt = await tx.wait();

      // TODO: This is a naive way of resync the UI's state with the table and chain state
      await games.findGames();
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  // TODO: active games should come from alchemy via `getPlayerGames(address)`, then games stored
  //       in tableland that don't show up in those results are finished and we will want to get
  //       them from the contract via `getGame(game_id)`
  findGames: async function (search?) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');

      // TODO: ? should we use SC call to get active games, which will include games
      //       that they haven't made a move on yet?  This would allow people to add players
      //       to games without the player's consent, but it would also help them find games
      //       they have been invited to.  Not sure which is appropriate.

      // get games I own and games I'm playing
      const ownerAddress = await _tableland.signer.getAddress();
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, _tableland.signer);
      const gamesCount = await tokenContract.balanceOf(ownerAddress);

      const ownedAndPlaying = [];
      const myOwnedGames = [];
      for (let i = 0; i < gamesCount; i++) {
        const gameId = await tokenContract.tokenOfOwnerByIndex(ownerAddress, i);
        const contractGame = await tokenContract.getGame(gameId);

        const params = new URLSearchParams();
        params.set('white', contractGame.player1);
        params.set('black', contractGame.player2);
        params.set('game', gameId);

        const game = {
          player1: contractGame.player1,
          player2: contractGame.player2,
          winner: contractGame.winner,
          bounty: contractGame.bounty,
          id: parseInt(gameId.toString(), 10),
          link: `${location.pathname}?${params.toString()}`
        };
        myOwnedGames.push(game);

        if (game.player1 === ownerAddress || game.player2 === ownerAddress) {
          ownedAndPlaying.push(game);
        }
      }

      ownedGames.set(myOwnedGames);

      // TODO: paginate based on search arg
      const res = await _tableland.read(sqlStatements.myMoves());
      const myMoves = parseResponse(res);

      const uniqueGames = myMoves.reduce(function (allGames, game) {
        const exists = allGames.find(gameId => game.game_id === gameId);
        if (typeof exists !== undefined) {
          return allGames;
        }

        return allGames.concat([game.game_id]);
      }, []);

      const gamesRes = await _tableland.read(sqlStatements.getGames(uniqueGames));

      const allMoves = parseResponse(gamesRes);
      const games = uniqueGames.map(function (gameId) {
        const whiteMove = allMoves.find(g => ~g.move.indexOf('white'));
        const whiteAddress = whiteMove?.player_address;
        const blackMove = allMoves.find(g => ~g.move.indexOf('black'));
        const blackAddress = blackMove?.player_address;

        if (!(whiteAddress && blackAddress)) {
          return;
        }

        return {
          id: gameId,
          link: `?game=${gameId}&white=${whiteAddress}&black=${blackAddress}`,
          player1: whiteAddress,
          player2: blackAddress
        };
      }).filter(g => g);

      for (let i = 0; i < ownedAndPlaying.length; i++) {
        const game = ownedAndPlaying[i];
        if (!games.find(g => g.id === game.id)) {
          games.push({
            id: game.id,
            link: `?game=${game.id}&white=${game.player1}&black=${game.player2}`,
            player1: game.player1,
            player2: game.player2
          });
        }
      }

      setGames(games);
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  loadGame: async function (loadGameId, black, white) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');
      if (typeof loadGameId === 'string') loadGameId = parseInt(loadGameId, 10);

      // reset the moves so UI can update
      setMoves([]);
      moves.unlistenForMoves();

      if (_address === white || _address === black) {
        _opponentAddress = white === _address ? black : white;
        audience.set(false);

        const color = white === _address ? 'white' : 'black';
        myColor.update(c => color);
      } else {
        audience.set(true);
      }

      gameId.set(loadGameId);
      await tick();

      const res = await _tableland.read(sqlStatements.loadGame(loadGameId, black, white));

      const game = parseResponse(res);
      setMoves(game.map(move => move.move));

      if (_audience) {
        // If the user is in the audience listen forever
        moves.listenForMoves(black, white, true);
      } else if (game.length && game[game.length - 1].player_address === _address) {
        // If this player made the last move, start waiting for the other player to make their move
        moves.listenForMoves(black, white);
      }


      const gameUrl = new URL(window.location as any);
      gameUrl.searchParams.set('white', white);
      gameUrl.searchParams.set('black', black);
      gameUrl.searchParams.set('game', loadGameId);
      window.history.pushState({}, '', gameUrl);

      whiteAddress.set(white);
      blackAddress.set(black);
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  unloadGame: function () {
    moves.unlistenForMoves();
    gameId.set('');
    setMoves([]);
    window.history.pushState({}, '', `${window.location.protocol}//${window.location.host}${window.location.pathname}`);
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

export const init = async function () {
  try {
    //const connectParams: ConnectOptions = {
      //chain: 'ethereum-goerli'
    //};
    const connectParams: ConnectOptions = {
      chain: 'local-tableland'
    };

    _tableland = await connect(connectParams);
    await _tableland.siwe();

    const decodedToken = atob(_tableland.token.token);

    const message = JSON.parse(decodedToken);
    const addr = ethers.utils.verifyMessage(message.message, message.signature);

    myAddress.update(address => addr);
    setConnected(true);

    const params = new URLSearchParams(location.search);
    _white = params.get('white');
    _black = params.get('black');
    const gameId = params.get('game');

    if (_white && _black && gameId) {
      await games.loadGame(gameId, _black, _white);
    }
  } catch (err) {
    console.log(err);
    alerts.addAlert(err.message, 'error');
  }
};

const sqlStatements = {
  doMove: (gameId: string, move: string) => `INSERT INTO ${MOVES_TABLENAME} (player_address, game_id, move) VALUES ('${_address}', '${gameId}', '${move}');`,
  myMoves: () => `SELECT * FROM ${MOVES_TABLENAME} WHERE player_address = '${_address}';`,
  loadGame: (game: string, black: string, white: string) => `
    SELECT * FROM ${MOVES_TABLENAME}
    WHERE game_id = '${game}'
    ORDER BY rowid ASC;
  `,
  getGames: (uniqueGames: string[]) => `
    SELECT * FROM ${MOVES_TABLENAME}
    WHERE game_id IN ('${uniqueGames.join('\',\'')}');
  `
};
