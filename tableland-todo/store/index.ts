import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { ethers } from 'ethers';

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
    // TODO: latency is potentially an issue, here I took an approach of keeping a local record of
    //       the state that makes the UI/UX snappy.  This has a downside of needing to manage
    //       this state and the Tableland state.
    //       See below for more thoughts on this.
    tasks: [] as Task[],
    tablelandTasks: [] as Task[]
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


// TODO: This presents an interesting choice in our design.
//       Will dApps that use Tableland potentially want to do some kind of queueing of
//       update requests so that clicks don't hammer validators? Might be especially nice if we implement
//       some sort of micro payment.
//       If the `@textile/tableland` lib can manage this for the dApp Devs they might appreciate it?
//       Maybe we choose a reasonable default then enable setting the frequency of syncs to the Tableland
//       Table in the library init options?  e.g. `const tableland = new Tableland({updateFreq: 15 * 60 * 1000})`
//       Maybe also enable something like the MongoDB concept of a write concern?

// track timeout so we can debounce and only run everyonce in a while
let debounceUpdate;
// setup a lock incase the update request takes a longtime
let updateRunning = false;

const sync = function (context) {
  // wait till the current update is done to send the next one...?
  if (updateRunning) return setTimeout(() => sync(context), 1000);
  if (debounceUpdate) return;

  debounceUpdate = setTimeout(async () => {
    updateRunning = true;
    try {
      // simulate it taking 7 seconds to get a response from Tableland, what is a realistic number?
      // 2 seconds? 7 minutes? an hour?
      await wait(7000);

      await context.commit('set', {
        key: 'tablelandTasks',
        value: context.state.tasks
      });
    } catch (err) {
      console.log(err);
    }
    updateRunning = false;
    debounceUpdate = null;
  // send an updates once every 2 seconds at most, if there's a micro payment mechanism this could be made much longer to save $$
  }, 2000);
};

export const actions: ActionTree<RootState, RootState> = {
  connectMetaMask: async function (context, params: {ethereum: any}) {
    console.log('connection to MetaMask...');

    // Note: hoisting these variables because of above mentioned workaround
    if (!unObservable.provider) {
      unObservable.provider = new ethers.providers.Web3Provider(params.ethereum);
    }
    if (!unObservable.signer) {
      unObservable.signer = unObservable.provider.getSigner();
    }
  },
  // TODO: send off async request to Tableland
  createTask: async function (context) {
    const task = {complete: false, name: '', id: getNextId(context.state.tasks)};

    const newTasks = context.state.tasks.concat([task]);

    context.commit('set', {key: 'tasks', value: newTasks});

    sync(context);

    return task;
  },
  // TODO: send off async request to Tableland
  updateTask: async function (context, task: Task) {
    const newTasks = context.state.tasks.map((t: Task) => {
      if (t.id !== task.id) return t;

      return task;
    });

    context.commit('set', {key: 'tasks', value: newTasks});

    sync(context);
  },
  // TODO: send off async request to Tableland
  deleteTask: async function (context, task: Task) {
    const newTasks = context.state.tasks.filter((t: Task) => t.id !== task.id);

    context.commit('set', {key: 'tasks', value: newTasks});

    sync(context);
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
