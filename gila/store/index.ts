import { createPinia, defineStore, setMapStoreSuffix } from 'pinia';
import { useRuntimeConfig } from '#nitro';
import { connect } from '@tableland/sdk';

const config = useRuntimeConfig();
setMapStoreSuffix('');


export type RootState = ReturnType<typeof state>
let messageId = 1;

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
      messages: [],
      connected: false,
      noAccount: false,

      myAddress: '',
      myTweets: [],
      whoIFollow: [],
      myTweetsTable: '',
      whoIFollowTable: '',
      myAccount: {},

      searchedAccounts: []
    };
  },

  actions: {
    alert: function (message) {
      if (typeof message === 'string') {
        message = {content: message, severity: 'error'};
      }

      message.id = ++messageId;

      this.messages.unshift(message);
    },
    connect: async function () {
      try {
        // connect to tableland
        console.log(`connecting to validator at: ${config.validatorHost}`);
        const tableland = await getConnection({
          host: config.validatorHost as string
        });

        // NOTE: there's a subtlety here.  By calling `list` we are only considering tables the user owns
        //       this avoids the, currently impossible, case that someone transfers ownership.  In the
        //       future table ownership transfer may be possible.  This means, selling your account would
        //       require transfering the wallet you used to create it.  In the future Tableland will probably
        //       have features that could enable the concept of selling your gila account.
        const myTables = await tableland.list();
        const address = await tableland.signer.getAddress();
        this.myAddress = address;

        let myTweetsTable = myTables.find((list: any) => {
          return list.name.indexOf(`${tablePrefixTweets}${address.slice(2,8).toLowerCase()}`) === 0;
        });
        let whoIFollowTable = myTables.find((list: any) => {
          return list.name.indexOf(`${tablePrefixWIF}${address.slice(2,8).toLowerCase()}`) === 0;
        });

        if (!myTweetsTable) {
          myTweetsTable = await tableland.create(sqlStatements.createMyTweets(address));
        }
        if (!whoIFollowTable) {
          whoIFollowTable = await tableland.create(sqlStatements.createWhoIFollow(address));
        }

        this.myTweetsTable = myTweetsTable.name;
        this.whoIFollowTable = whoIFollowTable.name;

        const tweetsRes = await tableland.query(`SELECT * FROM ${myTweetsTable.name}`);
        const followRes = await tableland.query(`SELECT * FROM ${whoIFollowTable.name}`);

        this.myTweets = parseRpcResponse(tweetsRes.data);
        this.whoIFollow = parseRpcResponse(followRes.data);

        await this.getAccount({
          tableland: tableland,
          address: address,
          tweets: myTweetsTable,
          follow: whoIFollowTable
        });

        await this.getFeed();

        this.connected = true;

      } catch (err) {
        throw err;
      }
    },
    getAccount: async function (params) {
      try {
        const tableland = params.tableland;
        const address = params.address;

        const myAccountRes = await tableland.query(sqlStatements.getMyAccount(address));
        const accountRows = parseRpcResponse(myAccountRes.data);
        const account = accountRows[0];
        if (!account) return this.init(params);
        this.myAccount = account;
      } catch (err) {
        // TODO: better parsing of error to determine if this is a missing account or something else
        if (err.message.match(/does not exist/i) && !params.retry) {
          return this.init(params);
        }
        throw err;
      }
    },
    tweet: async function (chirp) {
      try {
        const tableland = await getConnection({
          host: config.validatorHost as string
        });

        await tableland.query(sqlStatements.writeTweet({
          table: this.myTweetsTable,
          tweet: chirp.tweet,
          address: this.myAddress
        }));

        await this.getFeed();
      } catch (err) {
        throw err;
      }
    },
    getFeed: async function () {
      const tableland = await getConnection({
        host: config.validatorHost as string
      });

      const myTweets = parseRpcResponse((await tableland.query(sqlStatements.getTweets(this.myTweetsTable))).data);
      const following = parseRpcResponse((await tableland.query(sqlStatements.getFollowing(this.whoIFollowTable))).data);

      let othersTweets = [];

      for (let i = 0; i < following.length; i++) {
        const user = following[i];

        const table = user.tweets_tablename;
        const username = user.nickname || user.account_address;

        const res = await tableland.query(sqlStatements.getTweets(table));
        const twits = parseRpcResponse(res.data);

        othersTweets = othersTweets.concat(twits.map(tweet => {
          return {
            ...tweet,
            username: username
          };
        }));
      }

      this.myTweets = myTweets.map(tweet => {
        return {
          ...tweet,
          username: this.myAddress
        };
      }).concat(othersTweets).sort((a, b) => {
        return a.created_at > b.created_at ? 1 : -1;
      });
    },
    findFollowers: async function (address) {
      try {
        const tableland = await getConnection({
          host: config.validatorHost as string
        });

        const res = await tableland.query(sqlStatements.findFollowers(address, this.myAddress));

        const results = parseRpcResponse(res.data).filter(account => account.user_address !== this.myAddress);

        this.searchedAccounts = results;
      } catch (err) {
        throw err;
      }
    },
    followAccount: async function (account) {
      try {
        const tableland = await getConnection({
          host: config.validatorHost as string
        });

        await tableland.query(sqlStatements.addFollower({...account, table: this.whoIFollowTable}));

        await this.getFeed();
      } catch (err) {
        throw err;
      }
    },
    // At this point The user will need to request they be added to the table that tracks all users
    // In the future Tableland will potentially have more grainular control over ACL rules and we can
    // allow users to insert their own row given some set of circumstances
    init: async function (params) {
      try {
        const tableland = params.tableland;
        const address = params.address;

        const newAccount = await requestAccount(params);

        if (newAccount.ok === false) throw new Error('Could not register account: ' + newAccount.statusText);

        // try to get the account again, but if it fails the second time
        // just throw the error to avoid and endless loop of retrying
        this.getAccount({...params, retry: true});
      } catch (err) {
        throw err;
      }
    }
  }
});


const requestAccount = async function (params) {
  const url = config.accountService;
  if (!url) throw new Error('Account service not configured');

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({
      address: params.address,
      tweets: params.tweets,
      follow: params.follow
    })
  });

  return response.json();
};

const wait = function (ms: number) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(void 0), ms);
  });
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

const tablePrefixWIF = 'test1_who_i_follow_';
const tablePrefixTweets = 'test1_tweets_';
const allUsersTable = 'gila_all_users_670';

const addrTrunc = (address) => address.slice(2,8).toLowerCase();
const newSqlDate = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const sqlStatements = {
  // owned by dev
  getMyAccount: (address) => `SELECT * FROM ${allUsersTable} WHERE user_address = '${address}';`,
  // each user owns one of these
  createWhoIFollow: (address) => `CREATE TABLE ${tablePrefixWIF}${addrTrunc(address)} (
    account_address TEXT PRIMARY KEY,
    tweets_tablename TEXT,
    nickname TEXT,
    unfollowed BOOLEAN not null default false
  );`,
  createMyTweets: (address) => `CREATE TABLE ${tablePrefixTweets}${addrTrunc(address)} (
    tweet TEXT,
    tweet_id INT GENERATED ALWAYS AS IDENTITY,
    in_replyto_table TEXT,
    in_replyto_id TEXT,
    created_at DATE
  );`,
  getTweets: (tableName) => `
    SELECT * FROM ${tableName}
      ORDER BY created_at DESC
      LIMIT 10;
  `,
  getFollowing: (tableName) => `
    SELECT * FROM ${tableName} WHERE unfollowed = false;
  `,
  writeTweet: (params) => `
    INSERT INTO ${params.table} (
      tweet,
      in_replyto_table,
      in_replyto_id,
      created_at
    ) VALUES (
      '${params.tweet}',
      '${params.replyToTable || ''}',
      '${params.replyToId || ''}',
      '${newSqlDate()}'
    );
  `,
  findFollowers: (address, myAddress) => `
    SELECT * FROM ${allUsersTable} WHERE user_address LIKE '${address}%';
  `,
  addFollower: (params) => `
    INSERT INTO ${params.table} (
      account_address,
      tweets_tablename,
      nickname
    ) VALUES (
      '${params.user_address}',
      '${params.tweets_tablename}',
      '${params.nickname || ''}'
    );
  `
};
