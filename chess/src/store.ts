import { writable, derived } from 'svelte/store';
import type { Writable } from "svelte/store";
import { connect } from '@tableland/sdk';

// globally unique tablename that all players use
const CHESS_TABLENAME = 'chess_31337_1';

// internals
let _tableland, _address, _gameId;

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

const { subscribe: movesSubscribe, set: setMoves, update: updateMoves } = writable([]);
export const moves = {
  subscribe: movesSubscribe,
  doMove: async function (move) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');
      // TODO: send move to Tableland
      await _tableland.write(`INSERT INTO ${CHESS_TABLENAME} (player_address, game_id, move) VALUES ('${_address}', '${_gameId}', '${move}');`);

      updateMoves((allMoves): string[] => {
        return allMoves.concat([move]);
      });
    } catch (err) {
      alerts.addAlert(err.message, 'error');
    }
  }
}

const { subscribe: gamesSubscribe, set: setGames, update: updateGames } = writable([]);
export const games = {
  subscribe: gamesSubscribe,
  findGames: async function (search) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');

      // TODO: paginate based on search arg
      const myGames = await _tableland.read(`SELECT * FROM ${CHESS_TABLENAME} WHERE player_address = ${_address};`);
      setGames(parseResponse(myGames));
    } catch (err) {
      alerts.addAlert(err.message, 'error');
    }
  },
  loadGame: async function (gameId, opponentAddress) {
    try {
      if (!_tableland) throw new Error('you must connect to Tableland before playing');
      _gameId = gameId;

      const allPlayers = await _tableland.read(`SELECT * FROM ${CHESS_TABLENAME} WHERE gameId = ${gameId};`);
      const opponents = allPlayers.rows.reduce(function (acc, cur) {

      }, []);

      const game = await _tableland.read(`
        SELECT * FROM ${CHESS_TABLENAME}
        WHERE gameId = ${gameId}
          AND (player_address = ${_address} OR player_address = ${opponentAddress});
        ORDER BY move_id ASC
      `);

      setMoves(parseResponse(game).map(move => move.move));
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


export const init = async function () {
  try {
    _tableland = await connect({
      // TODO: this will need to be changed to whatever network this gets deployed on
      network: 'local', host: 'http://localhost:8080'
    });

    _address = await _tableland.signer.getAddress();
    setConnected(true);
  } catch (err) {
    alerts.addAlert(err.message, 'error');
  }
};
