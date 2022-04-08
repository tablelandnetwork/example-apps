import { createPinia, defineStore, setMapStoreSuffix } from 'pinia';
import { useRuntimeConfig } from '#nitro';
import { connect } from '@tableland/sdk';

const config = useRuntimeConfig();
setMapStoreSuffix('');


export type RootState = ReturnType<typeof state>


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
      connected: false,
      myTweets: [],
      whoIFollow: []
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

        const myTables = await tableland.list();

        const address = await tableland.signer.getAddress();
        let myTweets = myTables.find((list: any) => {
          return list.name.indexOf(`${tablePrefixWIF}${address.slice(2,8).toLowerCase()}`) === 0;
        });
        let whoIFollow = myTables.find((list: any) => {
          return list.name.indexOf(`${tablePrefixTweets}${address.slice(2,8).toLowerCase()}`) === 0;
        });

        if (!myTweets) {
          myTweets = await tableland.create(sqlStatements.myTweets(address));
        }
        if (!whoIFollow) {
          whoIFollow = await tableland.create(sqlStatements.whoIFollow(address));
        }

        const tweetsTable = await tableland.query(`SELECT * FROM ${myTweets.name}`);
        const followingTable = await tableland.query(`SELECT * FROM ${whoIFollow.name}`);

        console.log(tweetsTable);
        console.log(followingTable);

        this.connected = true;

      } catch (err) {
        throw err;
      }
    },
    init: async function () {
      try {
        const tableland = await getConnection({
          host: config.validatorHost as string
        });

        const address = await tableland.signer.getAddress();

        const myTweets = await tableland.create(sqlStatements(myTweets(address)));
        const whoIFollow = await tableland.create(sqlStatements(whoIFollow(address)));

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

const tablePrefixWIF = 'who_i_follow_';
const tablePrefixTweets = 'my_tweets_';

const addrTrunc = (address) => address.slice(2,8).toLowerCase();

const sqlStatements = {
  // owned by dev
  allUsers: `create table gila_users (
    user_address text primary key,
    tweets_tablename text,
    followers_tablename text,
    account_enabled boolean
  );`,

  // each user owns one of these
  whoIFollow: (address) => `create table ${tablePrefixWIF}${addrTrunc(address)} (
    account_address TEXT PRIMARY KEY,
    tweets_tablename TEXT,
    nickname TEXT,
    unfollowed BOOLEAN not null default false
  );`,
  myTweets: (address) => `create table ${tablePrefixTweets}${addrTrunc(address)} (
    tweet TEXT,
    tweet_id INTEGER PRIMARY KEY,
    in_replyto_table TEXT,
    in_replyto_id TEXT,
    created_at DATE
  );`
};
