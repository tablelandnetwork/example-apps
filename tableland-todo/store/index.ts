import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { ethers } from 'ethers';
import { connect, createTable, runQuery, myTables } from '@textile/js-tableland';



export interface Task {
  complete: boolean;
  name: string;
  deleted: boolean;
  id: number;
};

export const state = function () {
  return {
    ethAddress: '',
    listTable: [] as any,
    listTableId: '' as string,
    allTables: [] as any[],
    allTableIds: [] as string[],
    currentTableId: '' as string,
    currentTableName: '' as string,
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
    // TODO: table is a variation of a v4 uuid with 0x prepended and no dashes
    const table = await createTable(sql.createTable(params.name));
    const tableId = formatUuid(table.slice(2));
    const listTable = await runQuery(sql.insertList(params.name, tableId), context.state.listTableId) as any;

    if (listTable.error) {
      console.log(listTable.error);
      return;
    }

    await context.dispatch('loadTable', {
      tableId: tableId,
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
      const listTable = await runQuery(sql.selectListTable(), uuid) as any;

      console.log(listTable);
      // if the uuid matches a table with the right name for this app we will assume it is storing the list names
      // NOTE: this is definitely not a legitimate way to build a dApp since malicious dApps could have created this table
      //       with some sort of bad intent
      if (!listTable.error) {
        console.log('found list table with uuid: ' + uuid);
        context.commit('set', {key: 'listTableId', value: uuid});
        context.commit('set', {key: 'listTable', value: parseRpcResponse(listTable.result.data)});
        listTableExists = true;
        break;
      }
    }

    if (!listTableExists) {
      const tableIdNoFormat = await createTable(sql.createListTable());
      const listTableId = formatUuid(tableIdNoFormat.slice(2));

      console.log('created list table with uuid: ' + listTableId);
      context.commit('set', {key: 'listTableId', value: listTableId || ''});
      const listTable = await runQuery(sql.selectListTable(), listTableId) as any;
      if (!listTable.error) {
        context.commit('set', {key: 'listTable', value: parseRpcResponse(listTable.result.data)});
        listTableExists = true;
      }
    }

    // Save there their tables for later, if a table doesn't exist they can use the button to create a table...
    const listTables = context.state.listTable ? tables.map((registryData: any) => {
      const list = context.state.listTable.find((list: any) => compareUuids(list.uuid, registryData.uuid));

      return list;
    }).filter((t: any) => t) : [];
    context.commit('set', {key: 'allTables', value: listTables});
  },
  loadTable: async function (context, params: {tableId: string, name: string}) {
    console.log(params);
    const tableUuid = params.tableId.includes('-') ? params.tableId : formatUuid(params.tableId);
    const res = await runQuery(sql.selectTodoTable(params.name), tableUuid) as any;

    if (res.error) {
      console.log(res.error);
      return res.error;
    }

    const tasks = parseRpcResponse(res.result.data);

    context.commit('set', {key: 'tasks', value: tasks || []});
    context.commit('set', {key: 'currentTableId', value: params.tableId});
    context.commit('set', {key: 'currentTableName', value: params.name});
  },
  createTask: async function (context) {
    const task = {complete: false, name: '', id: getNextId(context.state.tasks)};

    // send off async request to Tableland
    const res = await runQuery(sql.insertTask(context.state.currentTableName, task), context.state.currentTableId) as any;

    if (res.error) {
      console.log(res.error);
      return new Error(res.error.message);
    }

    await context.dispatch('loadTable', {name: context.state.currentTableName, tableId: context.state.currentTableId});
    return task;
  },
  updateTask: async function (context, task: Task) {
    console.log(task);
    const res = await runQuery(sql.updateTask(context.state.currentTableName, task), context.state.currentTableId) as any;

    if (res.error) {
      console.log(res.error);
      return new Error(res.error.message);
    }

    await context.dispatch('loadTable', {name: context.state.currentTableName, tableId: context.state.currentTableId});
  },
  deleteTask: async function (context, task: Task) {
    console.log(task);
    const res = await runQuery(sql.deleteTask(context.state.currentTableName, task.id), context.state.currentTableId) as any;

    if (res.error) {
      console.log(res.error);
      return new Error(res.error.message);
    }

    await context.dispatch('loadTable', {name: context.state.currentTableName, tableId: context.state.currentTableId});
    await context.dispatch('loadTableDeleted');
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

const listTableName = 'todo_app_list_table';
const sql = {
  createTable: (name: string) => `CREATE TABLE ${name} (
    complete BOOLEAN DEFAULT false,
    name     VARCHAR DEFAULT '',
    deleted  BOOLEAN DEFAULT false,
    id       SERIAL
  );`,
  createListTable: () => `CREATE TABLE ${listTableName} (
    list_name VARCHAR NOT NULL,
    uuid VARCHAR NOT NULL
  );`,
  deleteTask: (name: string, taskId: number) => `
    UPDATE ${name} SET deleted = true WHERE id = ${taskId};
  `,
  insertList: (name: string, uuid: string) => `INSERT INTO ${listTableName}(list_name, uuid) VALUES ('${name}', '${uuid}');`,
  insertTask: (tableName: string, task: {complete: boolean, name: string, id: number}) => `
    INSERT INTO ${tableName}(complete, name, id) VALUES (${task.complete}, '${task.name}', ${task.id});
  `,
  selectListTable: () => `SELECT * FROM ${listTableName}`,
  selectTodoTable: (name: string) => `SELECT * FROM ${name}
    ORDER BY id ASC;
  `,
  updateTask: (name: string, task: {complete: boolean, name: string, id: number}) => `
    UPDATE ${name} SET complete = ${task.complete}, name = '${task.name}' WHERE id = ${task.id};
  `
};
