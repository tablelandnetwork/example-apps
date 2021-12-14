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
    provider: undefined,
    signer: undefined,
    ethAddress: undefined,
    // TODO: latency is potentially an issue, here I took an approach of keeping a local record of
    //       the state that makes the UI/UX snappy.  This has a downside of needing to manage
    //       this state and the Tableland state.
    //       See below for more thoughts on this.
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
  },
  // NOTE: ethers uses an Object with circular reference for signer and provider, so they can't be kept in reactive state
  //       for now workaround is to use private props + getter, and don't bother making these props reactive
  setUnObservable: function (state: any, data: KeyVal) {
    if (unObservable.hasOwnProperty(data.key)) {
      unObservable[data.key] = data.value;
    }
  }
};

const unObservable = {
  signer: undefined,
  provider: undefined
} as {
  [key: string]: any | undefined;
  signer: any | undefined;
  provider: any | undefined;
};

export const getters: GetterTree<RootState, RootState> = {
  getProvider: function () {
    return () => unObservable.provider;
  },
  getSigner: function () {
    return () => unObservable.signer;
  }
};


export const actions: ActionTree<RootState, RootState> = {
  connectMetaMask: async function (context, params: {ethereum: any}) {
    console.log('connection to MetaMask...');
    const { ethAccounts } = await connect('http://tableland.com');

    if (!ethAccounts[0]) createTable();
    //const select = await runQuery('SELECT * FROM persons');
    //console.log(select);

    const select = await runQuery('INSERT * FROM persons', ethAccounts[0]);
    console.log(select);
    return;
    // Note: hoisting these variables because of above mentioned workaround
    if (!unObservable.provider) {
      unObservable.provider = new ethers.providers.Web3Provider(params.ethereum);
    }
    if (!unObservable.signer) {
      unObservable.signer = unObservable.provider.getSigner();
    }

    const provider = unObservable.provider
    const signer = unObservable.signer

    await provider.send("eth_requestAccounts", []);

    const ethAddress = signer.getAddress();
    context.commit('set', {key: 'ethAddress', value: ethAddress});

    // TODO: get nonce from?
    //       this may be where we determine if the table exists or not.  If it exists we will get the nonce from the 
    //       tableland registry (or the validator, I don't know the answer to this)
    //       if the nonce doesn't exist then this pubkey hasn't got a table yet so we will create the table in the tableland registry
    //       then in the validator
    const nonce = getNonce();
    const msg = await signer.signMessage(nonce);

    // TODO: send message to?
    //       do we send this to the validator?
    console.log(msg)
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
