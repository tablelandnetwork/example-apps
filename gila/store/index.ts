import { createPinia, defineStore, setMapStoreSuffix } from 'pinia';
import { useRuntimeConfig } from '#nitro';
import { connect } from '@tableland/sdk';

const config = useRuntimeConfig();
setMapStoreSuffix('');


export type RootState = ReturnType<typeof state>

interface KeyVal {
  key: string;
  value: any;
};


// store the tableland connection as a private plain Object
const getConnection = function () {
  let connection: any;
  return async function (options?: any) {
    if (connection) return connection;

    connection = await connect({
      host: config.validatorHost as string
    });

    return connection;
  };
}();

export const store = defineStore('$store', {
  state: () => {
    return {
      connected: false
    };
  },

  actions: {
    connect: async function () {
      try {
        // connect to tableland
        console.log(`connecting to validator at: ${config.validatorHost}`);
        const tableland = await getConnection({
          host: config.validatorHost as string
        });

        this.connected = true;

      } catch (err) {
        throw err;
      }
    }
  }
});

const wait = function (ms: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(void 0), ms);
  });
};
