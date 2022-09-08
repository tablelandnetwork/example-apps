import { ethers, BigNumber } from 'ethers';
import { tick } from 'svelte';
import { writable, derived } from 'svelte/store';
import type { Writable } from "svelte/store";
import { connect, ConnectOptions, ChainName } from '@tableland/sdk';
import chessToken from '../evm/artifacts/contracts/ChessToken.sol/ChessToken.json';

/*
 * globals that will need to be set per chain
 */
// Need this so we can get moves when client is unauthenticated,
// i.e. market places wanting to show NFTs via animation_url
const VALIDATOR_HOST = process.env.VALIDATOR_HOST;
// The tableland network this app is running on
const TABLELAND_NETWORK = process.env.TABLELAND_NETWORK as ChainName;
// globally unique tablename that holds the moves for all players and all games
const MOVES_TABLENAME = process.env.MOVES_TABLENAME;
// globally unique tablename that holds NFT metadata
const TOKEN_TABLENAME = process.env.TOKEN_TABLENAME;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;

// global constants
const tokenAbi = chessToken.abi;
const moveWaitDiration = 5000;
const autoPlayDiration = 2000;

// TODO: use alchemy to get the games the user owns, and the games the user is actively playing

// TODO: enable minting a game with two players

// TODO: enable adding a bounty to a game

// internals
let _address;
let _audience;
let _black;
let _bounty;
let _gameId;
let _intervalId;
let _autoPlayIntervalId;
let _moves;
let _myColor;
let _owner;
let _opponentAddress;
let _tableland;
let _white;

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

export const currentGame = writable();
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

// Flag that tracks if the user just watching the game
export const audience = writable(false);
audience.subscribe(isAudience => _audience = isAudience);

// Flag that tracks if the user is the owner of the game
export const owner = writable(false);
owner.subscribe(isOwner => _owner = isOwner);

export const bounty = writable('');
owner.subscribe(newBounty => _bounty = newBounty);

export const officialWinner = writable('');


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
      const res = await _tableland.read(sqlStatements.loadGame(_gameId));

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
  certifyWinner: async function (tokenId, color: string) {
    try {
      let winnerAddress;
      if (color === 'white') winnerAddress = _white;
      if (color === 'black') winnerAddress = _black;

      // should never end up throwing this, but checking just in case
      if (!winnerAddress) throw new Error('cannot get winner address');

      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, _tableland.signer);
      const tx = await tokenContract.setWinner(BigNumber.from(tokenId), winnerAddress);

      await tx.wait();

      // reload to update UI
      await games.loadGame(tokenId, _black, _white);
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
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
          owner: ownerAddress,
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

      // At this point we have all the games the user owns, both playing and not playing
      // To get the games they are playing but don't own we will get all the moves they have made
      // then collect the set of `game_id`s that aren't in the the ownedAndPlaying Array

      // TODO: paginate based on search arg
      const res = await _tableland.read(sqlStatements.myMoves());
      const myMoves = parseResponse(res);

      const uniqueGames = myMoves.reduce(function (allGames, move) {
        const exists = allGames.find(gameId => move.game_id === gameId);
        if (typeof exists !== 'undefined') {
          // we already have the game_id in the Array
          return allGames;
        }

        if (ownedAndPlaying.find(g => move.game_id === g.id)) {
          // we already have the game_id in the ownedAndPlaying Array
          return allGames;
        }

        // add the game_id to the Array
        return allGames.concat([move.game_id]);
      }, []);

      // Now we collect all games this user is playing, owned and not owned,
      // in one Writeable for the views to use as needed
      const games = [];
      for (let i = 0; i < uniqueGames.length; i++) {
        const gameId = uniqueGames[i];

        const contractGame = await tokenContract.getGame(gameId);

        games.push({
          id: gameId,
          link: `?game=${gameId}&white=${contractGame.player1}&black=${contractGame.player2}`,
          player1: contractGame.player1,
          player2: contractGame.player2,
          owner: contractGame.owner,
          bounty: contractGame.bounty,
          winner: contractGame.winner
        });
      }

      for (let i = 0; i < ownedAndPlaying.length; i++) {
        const game = ownedAndPlaying[i];
        if (!games.find(g => g.id === game.id)) {
          games.push({
            id: game.id,
            link: `?game=${game.id}&white=${game.player1}&black=${game.player2}`,
            player1: game.player1,
            player2: game.player2,
            owner: game.owner,
            bounty: game.bounty,
            winner: game.winner
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
      bounty.set('');
      officialWinner.set('');

      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, _tableland.signer);
      const tokenOwner = await tokenContract.ownerOf(BigNumber.from(loadGameId));

      owner.set(_address === tokenOwner);

      const game = await tokenContract.getGame(BigNumber.from(loadGameId));
      currentGame.set({id: loadGameId, owner: tokenOwner, ...game});

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

      const res = await _tableland.read(sqlStatements.loadGame(loadGameId));

      const gameMoves = parseResponse(res);
      setMoves(gameMoves.map(move => move.move));

      const currentBounty = ethers.utils.parseEther(game.bounty.toString()).toString();

      bounty.set(currentBounty === '0' ? '' : currentBounty);
      if (game.winner && game.winner.indexOf('0x0000000000000000000000000') === -1) {
        officialWinner.set(game.winner);
      }

      if (_audience) {
        // If the user is in the audience listen forever
        moves.listenForMoves(black, white, true);
      } else if (gameMoves.length && gameMoves[gameMoves.length - 1].player_address === _address) {
        // If this player made the last move, start waiting for the other player to make their move
        moves.listenForMoves(black, white);
      } else if (gameMoves.length === 0 && _address === black) {
        // If this player is black and white hasn't made the first move yet
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
  getGameMoves: async function (gameId) {
    try {
      const urlStatement = sqlStatements.loadGame(gameId)
        .trim()
        .replace('\n', '')
        .replace(';', '')
        .replace(/\s\s+/g, ' ');
      const res = await fetch(
        `${VALIDATOR_HOST}/query?s=${urlStatement}&mode=json`
      );
      const moves = await res.json();
      console.log(moves);
      setMoves(moves.map(move => move.move));
    } catch (err) {
      console.log(err);
      alerts.addAlert(err.message, 'error');
    }
  },
  unloadGame: function () {
    moves.unlistenForMoves();
    gameId.set('');
    setMoves([]);
    currentGame.set(undefined);
    window.history.pushState({}, '', `${window.location.protocol}//${window.location.host}${window.location.pathname}`);
  },
  startAutoPlay: function () {
    // clone moves so that we can set then on a loop
    const allMoves = _moves.map(m => String(m));
    let currentMove = 0;
    _autoPlayIntervalId = setInterval(function () {
      setMoves(allMoves.slice(0, currentMove % (allMoves.length + 1)));
      currentMove++;
    }, autoPlayDiration);
  },
  stopAutoPlay: function () {
    clearInterval(_autoPlayIntervalId);
  }
};

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
    const connectParams: ConnectOptions = {
      chain: TABLELAND_NETWORK
    };

    _tableland = connect(connectParams);
    await _tableland.siwe();

    if (!_tableland.token?.token) return;

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
  loadGame: (game: string) => `
    SELECT * FROM ${MOVES_TABLENAME}
    WHERE game_id = '${game}'
    ORDER BY rowid ASC;
  `,
  getGames: (uniqueGames: string[]) => `
    SELECT * FROM ${MOVES_TABLENAME}
    WHERE game_id IN ('${uniqueGames.join('\',\'')}');
  `
};
