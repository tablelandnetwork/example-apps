import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { ethers } from 'ethers';
import { connect, createTable, runQuery } from '@textile/js-tableland';

declare global {
    interface Window {
        ethereum: any;
    }
};

export interface Task {
  complete: boolean;
  name: string;
  id: number;
};

export const state = function () {
  return {
    ethAddress: undefined,
    allTables: [] as any[],
    currentTable: undefined,
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

const mockData = {
  allTables: [] as any[],
  currentTable: {} as any,
  tasks: [] as Task[]
}

export const actions: ActionTree<RootState, RootState> = {
  connect: async function (context, params: {ethereum: any}) {
    // connect to tableland
    const res = await connect('http://tableland.com');
    console.log(res);
    const { ethAccounts } = res;

    // save the user's eth account address
    context.commit('set', {key: 'ethAddress', value: ethAccounts[0]});

    // get all of the user's existing tables
    await context.dispatch('loadTables');
  },
  createTable: async function (context, params) {
    mockData.allTables.push({name: params.name, tableId: Math.ceil(100000 * Math.random())});
    return;
    // TODO: table.js not finished
    await createTable(params.name);

    // refresh the list of all of the user's existing tables
    await context.dispatch('loadTables');
  },
  loadTables: async function (context) {
    const tables: any = await runQuery(`SELECT * FROM "system_tables" WHERE controller = '${context.state.ethAddress}'`);

    if (tables.error) {
      console.log(tables.error);
      context.commit('set', {key: 'allTables', value: []});
      return;
    }

    // Save there their tables for later, if a table doesn't exist they can use the button to create a table...
    context.commit('set', {key: 'allTables', value: tables || []});
  },
  loadTable: async function (context, params) {
    const tasks = await runQuery(`SELECT * FROM ${params.tableId}`);

    context.commit('set', {key: 'tasks', value: tasks || []});
    context.commit('set', {key: 'currentTable', value: params.tableId});
  },
  // TODO: send off async request to Tableland
  createTask: async function (context) {
    const task = {complete: false, name: '', id: getNextId(context.state.tasks)};

    const newTasks = context.state.tasks.concat([task]);

    context.commit('set', {key: 'tasks', value: newTasks});

    return task;
  },
  // TODO: send off async request to Tableland
  updateTask: async function (context, task: Task) {
    const newTasks = context.state.tasks.map((t: Task) => {
      if (t.id !== task.id) return t;

      return task;
    });

    context.commit('set', {key: 'tasks', value: newTasks});
  },
  // TODO: send off async request to Tableland
  deleteTask: async function (context, task: Task) {
    const newTasks = context.state.tasks.filter((t: Task) => t.id !== task.id);

    context.commit('set', {key: 'tasks', value: newTasks});
  }
};

const wait = function (waittime: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(void 0), waittime);
  });
};

const getNextId = function (tasks: Task[]) {
  const taskIds = tasks.map((task: Task) => task.id).sort((a: number, b: number) => a > b ? 1 : -1);
  const lastId = taskIds[taskIds.length - 1];

  return (lastId || 0) + 1;
};

const getNonce = function () {
  return getIntStr() + getIntStr() + getIntStr() + getIntStr() + getIntStr();
};

const getIntStr = function () {
  return Math.ceil(Math.random() * 10).toString();
};
