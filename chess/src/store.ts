import { tick } from 'svelte';
import { writable, derived } from 'svelte/store';
import type { Writable } from "svelte/store";
import { connect } from '@tableland/sdk';

// globally unique tablename that all players use
const CHESS_TABLENAME = 'chess_31337_2';
const moveWaitDiration = 5000;

// internals
let _audience, _tableland, _gameId, _address, _opponentAddress, _myColor, _moves;

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

      await _tableland.write(sqlStatements.doMove(_gameId, move));

      updateMoves((allMoves): string[] => {
        return allMoves.concat([move]);
      });

      moves.listenForMoves();
    } catch (err) {
      alerts.addAlert(err.message, 'error');
    }
  },
  listenForMoves: function (forever = false) {
    const intervalId = setInterval(async function () {
      const res = await _tableland.read(sqlStatements.loadGame());

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
      alerts.addAlert(err.message, 'error');
    }
  },
  loadGame: async function (loadGameId, opponentAddress) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');
      gameId.update(gid => loadGameId);
      await tick();

      const res = await _tableland.read(sqlStatements.loadGame());

      const game = parseResponse(res);
      setMoves(game.map(move => move.move));

      if (!_audience) {
        const color = getMyColor(game);
        myColor.update(c => color);
      }

      // If this player made the last move, start waiting for the other player to make their move
      if (game.length && game[game.length - 1].player_address === _address) {
        moves.listenForMoves();
      }
    } catch (err) {
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
    const connectParams = {
      // TODO: this will need to be changed to whatever network this gets deployed on
      network: 'localhost', host: 'http://localhost:8080'
    };
    if (token) {
      connectParams.token = {token};
    }

    _tableland = await connect(connectParams);

    localStorage.setItem('tableland.token', _tableland.token.token);

    const addr = await _tableland.signer.getAddress();
    myAddress.update(address => addr);
    setConnected(true);

    const params = new URLSearchParams(location.search);
    const white = params.get('white');
    const black = params.get('black');
    const gameId = params.get('game');

    if (white && black && gameId) {
      if (addr === white || addr === black) {
        _opponentAddress = white === addr ? black : white;
      } else {
        audience.set(true);
      }

      await games.loadGame(gameId, _opponentAddress);
    }
  } catch (err) {
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
  doMove: (gameId, move) => `INSERT INTO ${CHESS_TABLENAME} (player_address, game_id, move) VALUES ('${_address}', '${gameId}', '${move}');`,
  myMoves: () => `SELECT * FROM ${CHESS_TABLENAME} WHERE player_address = '${_address}';`,
  loadGame: () => `
    SELECT * FROM ${CHESS_TABLENAME}
    WHERE game_id = '${_gameId}'
      AND (player_address = '${_address}' OR player_address = '${_opponentAddress}')
    ORDER BY move_id ASC;
  `,
  getGames: (uniqueGames) => `
    SELECT * FROM ${CHESS_TABLENAME}
    WHERE game_id IN ('${uniqueGames.join('\',\'')}');
  `
};
