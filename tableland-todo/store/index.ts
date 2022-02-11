import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { ethers } from 'ethers';
import { connect } from '@textile/tableland';



export interface Task {
  complete: boolean;
  name: string;
  deleted: boolean;
  id: number;
};

export const state = function () {
  return {
    alertMessage: '',
    tableland: {} as any,
    listTable: [] as any,
    currentTableId: '' as string,
    currentTableName: '' as string,
    currentQueryableName: '' as string,
    tasks: [] as Task[]
  };
};

const getConnection = function () {
  let connection: any;
  return async function (options?: any) {
    if (connection) return connection;

    connection = await connect({
      host: process.env.validatorHost as string
    });

    return connection;
  };
}();

export type RootState = ReturnType<typeof state>

interface KeyVal {
  key: string;
  value: any;
};

export const mutations: MutationTree<RootState> = {
  set: function (state: any, data: KeyVal) {
    state[data.key] = data.value;
  }
};


export const actions: ActionTree<RootState, RootState> = {
  alert: async function (context, params) {
    // There are potentially components watching alertMessage that will alter the view
    // e.g. a Toast message
    context.commit('set', {key: 'alertMessage', value: params.message});
    // because this "has side affects" we want it to be async so that callers of alert
    // can await then manipulate the view with the new state
    await wait(0);
  },
  connect: async function (context) {
    try {
      // connect to tableland
      console.log(`connecting to validator at: ${process.env.validatorHost}`);
      await getConnection({
        host: process.env.validatorHost as string
      });

      // get all of the user's existing tables
      await context.dispatch('loadTables');
    } catch (err) {
      throw err;
    }
  },
  init: async function (context) {
    try {
      const tableland = await getConnection();

      // get all of the user's existing tables
      const res = await tableland.create(sql.createListTable());
      console.log(res);
    } catch (err) {
      throw err;
    }
  },
  createList: async function (context, params) {
    try {
      const listName = params.name;
      const tableName = 'todo_' + params.name.trim().replaceAll(' ', '_');
      const tableland = await getConnection();

      const table = await tableland.create(sql.createList(tableName));
      const queryableName = table.name as string;

      // stripping the id from queryable name
      const tableId = queryableName.split('_').pop() as string;
      const listOwner = await tableland.signer.getAddress();
      const listTable = await tableland.query(sql.insertList(listName, queryableName, tableId, listOwner)) as any;

      await context.dispatch('loadTable', {
        name: queryableName
      });

      // refresh the list of all of the user's existing tables
      await context.dispatch('loadTables');
    } catch (err) {
      throw err;
    }
  },
  loadTables: async function (context) {
    let listTable;
    try {
      const tableland = await getConnection();
      const listOwner = await tableland.signer.getAddress();
      listTable = await tableland.query(sql.selectListTable(listOwner)) as any;

      context.commit('set', {key: 'listTable', value: parseRpcResponse(listTable.data)});
    } catch (err) {
      throw err;
    }
  },
  loadTable: async function (context, params: {name: string}) {
    try {
      const tableland = await getConnection();
      const queryableName = `${params.name}`;
      const res = await tableland.query(sql.selectTodoTable(queryableName)) as any;

      const tasks = parseRpcResponse(res.data);

      context.commit('set', {key: 'tasks', value: tasks || []});

      context.commit('set', {key: 'currentQueryableName', value: queryableName});
      const currentTable = context.state.listTable.find((list: any) => list.table_name === queryableName);
      if (currentTable && currentTable.list_name) {
        context.commit('set', {key: 'currentTableName', value: currentTable.list_name});
      }
    } catch (err) {
      throw err;
    }
  },
  createTask: async function (context) {
    try {
      const task = {complete: false, name: '', id: getNextId(context.state.tasks)};
      const tableland = await getConnection();
      
      // send off async request to Tableland
      const res = await tableland.query(sql.insertTask(context.state.currentQueryableName, task)) as any;

      if (res.error) {
        console.log(res.error);
        await context.dispatch('loadTable', {name: context.state.currentQueryableName});
        return new Error(res.error.message);
      }

      await context.dispatch('loadTable', {name: context.state.currentQueryableName});
      return task;
    } catch (err) {
      throw err;
    }
  },
  updateTask: async function (context, task: Task) {
    try {
      const tableland = await getConnection();
      const res = await tableland.query(sql.updateTask(context.state.currentQueryableName, task)) as any;

      await context.dispatch('loadTable', {name: context.state.currentQueryableName});
    } catch (err) {
      throw err;
    }
  },
  deleteTask: async function (context, task: Task) {
    try {
      const tableland = await getConnection();

      const res = await tableland.query(sql.deleteTask(context.state.currentQueryableName, task.id)) as any;

      await context.dispatch('loadTable', {name: context.state.currentQueryableName});
    } catch (err) {
      throw err;
    }
  }
};

const getNextId = function (tasks: Task[]) {
  const taskIds = tasks.map((task: Task) => task.id).sort((a: number, b: number) => a > b ? 1 : -1);
  const lastId = taskIds[taskIds.length - 1];

  return (lastId || 0) + 1;
};

// RPC responds with rows and columns in separate arrays, this will combine to an array of objects
const parseRpcResponse = function (data: {rows: any[], columns: {name: string}[]}) {
  return data.rows.map((rowArr) => {
    const row = {} as {[key: string]: any};
    for (let i = 0; i < data.columns.length; i++) {
      const key = data.columns[i].name;
      row[key] = rowArr[i];
    }

    return row;
  });
};

const compareUuids = function (a: string, b: string) {
  return a.replaceAll(' ', '').replaceAll('-', '') === b.replaceAll(' ', '').replaceAll('-', '');
};

const formatUuid = function (val: string) {
  return [val.slice(0, 8), val.slice(8, 12), val.slice(12, 16), val.slice(16, 20), val.slice(20)].join('-');
};

// this is here for reference only. Creating the table that holds all lists only happens once ever when this app is built
const listTableCreateName = 'todo_app_all_lists_v1';
const listTableName = 'todo_app_all_lists_v1_10';
/*
 *
 * list_name TEXT, table_name TEXT, table_id TEXT, table_controller TEXT
 *
 */
const sql = {
  createList: (name: string) => `CREATE TABLE ${name} (
    complete BOOLEAN DEFAULT false,
    name     VARCHAR DEFAULT '',
    deleted  BOOLEAN DEFAULT false,
    id       INTEGER UNIQUE
  );`,
  deleteTask: (name: string, taskId: number) => `
    UPDATE ${name} SET deleted = true WHERE id = ${taskId};
  `,
  insertList: (listName: string, tableName: string, tableId: string, tableController: string) => `
    INSERT INTO ${listTableName}(
      list_name,
      table_name,
      table_id,
      table_controller
    ) VALUES (
      '${listName}',
      '${tableName}',
      '${tableId}',
      '${tableController}'
    );
  `,
  insertTask: (tableName: string, task: {complete: boolean, name: string, id: number}) => `
    INSERT INTO ${tableName}(complete, name, id) VALUES (${task.complete}, '${task.name}', ${task.id});
  `,
  createListTable: () => `CREATE TABLE ${listTableCreateName} (
    list_name TEXT,
    table_name TEXT,
    table_id TEXT,
    table_controller TEXT
  );`,
  selectListTable: (listOwner: string) => `SELECT * FROM ${listTableName} WHERE table_controller = '${listOwner}';`,
  selectTodoTable: (name: string) => `SELECT * FROM ${name}
    ORDER BY id ASC;
  `,
  updateTask: (name: string, task: {complete: boolean, name: string, id: number}) => `
    UPDATE ${name} SET complete = ${task.complete}, name = '${task.name}' WHERE id = ${task.id};
  `
};

const wait = function (ms: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(void 0), ms);
  });
};
