import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { ethers } from 'ethers';
import { connect, createTable, runQuery, myTables } from '@textile/js-tableland';



export interface Task {
  complete: boolean;
  name: string;
  id: number;
};

export const state = function () {
  return {
    ethAddress: '',
    listTable: {} as any,
    allTables: [] as any[],
    allTableIds: [] as string[],
    currentTable: undefined,
    currentListName: '' as string,
    tasks: [] as Task[]
  };
};

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
  connect: async function (context) {
    // connect to tableland
    console.log(`connecting to validator at: ${process.env.validatorHost}`);
    const res = await connect(process.env.validatorHost as string);
    console.log(res);
    const { ethAccounts } = res;

    // save the user's eth account address
    context.commit('set', {key: 'ethAddress', value: ethAccounts[0]});

    // get all of the user's existing tables
    await context.dispatch('loadTables');
  },
  createTable: async function (context, params) {
    console.log('createTable');
    // TODO: table.js not finished
    const table = await createTable(sql.createTable(params.name));
    const listTable = await runQuery(sql.insertList(params.name, table.slice(2)), listTableId) as any;

    if (listTable.error) {
      console.log(listTable.error);
      return;
    }

    await context.dispatch('loadTable', {
      tableId: table.tableId, /* TODO: don't know what `createTable` returns, this might be table.table_id */ 
      name: params.name
    });

    // refresh the list of all of the user's existing tables
    await context.dispatch('loadTables');
  },
  loadTables: async function (context) {
    // get all the tables controlled by this user's eth address
    const tables: any = await myTables();

    if (tables.error) {
      console.log(tables.error);
      context.commit('set', {key: 'allTables', value: []});
      return;
    }

    let listTableExists;
    // TODO: I can't find a way to do this that makes sense unless we add another column to the registry table
    for (let i = 0; i < tables.length; i++) {
      // We are going to loop through every table uuid this ethAccount has in the registry table,
      // NOTE: some of these might not have anything to do with the todo app
      const uuid = tables[i].uuid;
      const listTable = await runQuery(sql.selectTable('todo_app_list_table'), uuid) as any;

      console.log(listTable);
      // if the uuid matches a table with the right name for this app we will assume it is storing the list names
      // NOTE: this is definitely not a legitimate way to build a dApp since malicious dApps could have created this table
      //       with some sort of bad intent
      if (!listTable.error) {
        context.commit('set', {key: 'listTable', value: parseRpcResponse(listTable.result.data)});
        listTableExists = true;
        break;
      }
    }

    if (!listTableExists) {
      const { tableId: listTableId } = await createTable(sql.createListTable());

      const listTable = await runQuery(sql.selectTable('todo_app_list_table'), listTableId) as any;
      if (!listTable.error) {
        context.commit('set', {key: 'listTable', value: parseRpcResponse(listTable.result.data)});
        listTableExists = true;
      }
    }

    // Save there their tables for later, if a table doesn't exist they can use the button to create a table...
    const listTables = tables.map((registryData: any) => {
      const list = context.state.listTable.find((list: any) => compareUuids(list.uuid, registryData.uuid));

      return list;
    }).filter((t: any) => t);
    context.commit('set', {key: 'allTables', value: listTables});
  },
  loadTable: async function (context, params) {
    const res = await runQuery(sql.selectTable(params.name), params.tableId) as any;

    if (res.error) {
      console.log(res.error);
      return res.error;
    }

    const tasks = parseRpcResponse(res.result.data);

    context.commit('set', {key: 'tasks', value: tasks || []});
    context.commit('set', {key: 'currentTable', value: params.tableId});
    context.commit('set', {key: 'currentListName', value: params.name});
  },
  createTask: async function (context) {
    const task = {complete: false, name: '', id: getNextId(context.state.tasks)};

    // TODO: send off async request to Tableland


    const newTasks = context.state.tasks.concat([task]);
    context.commit('set', {key: 'tasks', value: newTasks});

    return task;
  },
  updateTask: async function (context, task: Task) {
    // TODO: send off async request to Tableland

    const newTasks = context.state.tasks.map((t: Task) => {
      if (t.id !== task.id) return t;

      return task;
    });
    context.commit('set', {key: 'tasks', value: newTasks});
  },
  deleteTask: async function (context, task: Task) {
    const newTasks = context.state.tasks.filter((t: Task) => t.id !== task.id);
    
    // TODO: send off async request to Tableland
    context.commit('set', {key: 'tasks', value: newTasks});
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

const listTableName = 'todo_app_list_table';
const listTableId = '19fe4f67-a51c-4815-bb4a-fc639ff1eb1b';
const sql = {
  createTable: (name: string) => `CREATE TABLE ${name} (
    complete BOOLEAN DEFAULT false,
    name     VARCHAR DEFAULT '',
    id       SERIAL,
  );`,
  createListTable: () => `CREATE TABLE ${listTableName} (
    list_name VARCHAR NOT NULL,
    uuid VARCHAR NOT NULL
  );`,
  insertList: (name: string, uuid: string) => `INSERT INTO ${listTableName}(list_name, uuid) VALUES ('${name}', '${uuid}');`,
  selectTable: (name: string) => `SELECT * FROM ${name};`
};
