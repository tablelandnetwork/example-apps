import { ethers } from 'ethers';
import { createPinia, defineStore, setMapStoreSuffix } from 'pinia';
import { connect, ConnectOptions } from '@tableland/sdk';
import { PreparedStatement } from 'pg-promise';
import { useRuntimeConfig } from '#imports';


setMapStoreSuffix('');


export type RootState = ReturnType<typeof state>
let messageId = 1;

// store the tableland connection as a private plain Object
const getConnection = function () {
  let connection: any;
  return async function (options?: any) {
    if (connection) return connection;

    const params = {
      chain: options.chain
    };
    if (options.contract) params.contract = options.contract;
    if (options.host) params.host = options.host;

    connection = await connect(params);
    await connection.siwe();

    return connection;
  };
}();

// store the tableland connection as a private plain Object
const getProvider = function () {
  let provider: any;
  return function (options?: any) {
    if (provider) return provider;

    provider = new ethers.providers.AlchemyProvider('goerli', options.apiKey);

    return provider;
  };
}();

export const store = defineStore('$store', {
  state: () => {
    // have to wait until nuxt is finished setting itself up
    const config = useRuntimeConfig();

    return {
      config: {
        host: config.public.validatorHost,
        chain: config.public.chain,
        contract: config.public.contract,
        network: config.public.validatorNet,
        accountService: config.public.accountService,
        alchemyApiKey: config.public.alchemyApiKey
      },
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
        console.log(`connecting to validator at: ${this.config.host}`);
        const tableland = await getConnection(this.config);

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
          this.alert({
            severity: 'info',
            content: 'Creating your Tweets table, you will have to pay gas for this. It usually takes about a minute. \nNOTE: make sure you\'re on Goerli!'
          });
          
          myTweetsTable = await tableland.create(
            sqlStatements.schemaMyTweets(),
            { prefix: `${tablePrefixTweets}${addrTrunc(address)}` }
          );
        }
        if (!whoIFollowTable) {
          this.alert({
            severity: 'info',
            content: 'Creating your Following table, you will have to pay gas for this. It usually takes about a minute. \nNOTE: make sure you\'re on Goerli!'
          });

          whoIFollowTable = await tableland.create(
            sqlStatements.schemaWhoIFollow(),
            { prefix: `${tablePrefixWIF}${addrTrunc(address)}` }
          );
        }

        this.myTweetsTable = myTweetsTable.name;
        this.whoIFollowTable = whoIFollowTable.name;

        const tweetsRes = await tableland.read(`SELECT * FROM ${myTweetsTable.name}`);
        const followRes = await tableland.read(`SELECT * FROM ${whoIFollowTable.name}`);

        this.myTweets = parseRpcResponse(tweetsRes);
        this.whoIFollow = parseRpcResponse(followRes);

        // automatically follow yourself
        if (!this.whoIFollow.find(account => account.account_address === this.myAddress)) {
          await this.followAccount({
            user_address: this.myAddress,
            tweets_tablename: this.myTweetsTable,
            nickname: 'my account'
          });
        }

        await this.getAccount({
          tableland: tableland,
          address: address,
          tweets: myTweetsTable,
          follow: whoIFollowTable
        });

        await this.getFeed();

        this.connected = true;

      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    tweet: async function (chirp) {
      try {
        const tableland = await getConnection(this.config);

        await tableland.write(sqlStatements.writeTweet({
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
      const tableland = await getConnection(this.config);

      const following = parseRpcResponse((await tableland.read(sqlStatements.getFollowing(this.whoIFollowTable))));

      let tweets = [];

      const provider = getProvider(this.config.alchemyApiKey);
      for (let i = 0; i < following.length; i++) {
        const user = following[i];

        const table = user.tweets_tablename;
        const ens = await provider.lookupAddress(user.account_address);

        const account = ens || user.account_address;

        const username = user.nickname ? `${user.nickname} (${account})` : account;

        const res = await tableland.read(sqlStatements.getTweets(table));
        const twits = parseRpcResponse(res);

        tweets = tweets.concat(twits.map(tweet => {
          return {
            ...tweet,
            nickname: user.nickname,
            account_address: user.account_address,
            username: username
          };
        }));
      }

      this.myTweets = tweets.sort((a, b) => {
        return a.created_at < b.created_at ? 1 : -1;
      });
    },
    findFollowers: async function (address) {
      try {
        const tableland = await getConnection(this.config);

        const res = await tableland.read(sqlStatements.findFollowers(address, this.myAddress));

        const results = parseRpcResponse(res).filter(account => {
          return account.user_address !== this.myAddress
        }).filter(account => {
          return !this.whoIFollow.find(follow => follow.account_address === account.user_address);
        });

        this.searchedAccounts = results;
      } catch (err) {
        throw err;
      }
    },
    updateNickname: async function (params) {
      try {
        if (params.newNickname === params.oldNickname) return;

        const tableland = await getConnection(this.config);

        await tableland.write(sqlStatements.updateNickname({
          followTable: this.whoIFollowTable,
          nickname: params.newNickname,
          account: params.account_address
        }));
      } catch (err) {
        throw err;
      }
    },
    followAccount: async function (account) {
      try {
        const tableland = await getConnection(this.config);

        await tableland.write(sqlStatements.addFollower({...account, table: this.whoIFollowTable}));

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

        const newAccount = await this.requestAccount(params);

        if (newAccount.ok === false) throw new Error('Could not register account: ' + newAccount.statusText);

        // try to get the account again, but if it fails the second time
        // just throw the error to avoid and endless loop of retrying
        this.getAccount({...params, retry: true});
      } catch (err) {
        throw err;
      }
    },
    getAccount: async function (params) {
      try {
        const tableland = params.tableland;
        const address = params.address;

        const myAccountRes = await tableland.read(sqlStatements.getMyAccount(address));
        const accountRows = parseRpcResponse(myAccountRes);
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
    requestAccount: async function (params) {
      const url = this.config.accountService;
      if (!url) throw new Error('Account service not configured');

      this.alert({
        severity: 'info',
        content: `Requesting to have your account added to the Gila Users Table. This costs gas but Tableland is paying!
                  All you have to do is sign a message proving you control your wallet address.`
      });

      const message = Date.now().toString();
      const signature = await params.tableland.signer.signMessage(message);

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
          message: message,
          signature: signature,
          address: params.address,
          tweets: params.tweets.name,
          follow: params.follow.name
        })
      });

      return response;
    }
  }
});


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

const tablePrefixWIF = 'gila2_who_i_follow_';
const tablePrefixTweets = 'gila2_tweets_';
const allUsersTable = 'gila_all_users_5_16';

const addrTrunc = (address) => address.slice(2,8).toLowerCase();
const newSqlDate = () => Date.now();
const escapeText = (text) => text.trim().replace(/'/g, "‘");

const sqlStatements = {
  // owned by dev
  getMyAccount: (address) => `SELECT * FROM ${allUsersTable} WHERE user_address = '${address}';`,
  // each user owns one of these
  schemaWhoIFollow: () => `
    account_address TEXT PRIMARY KEY,
    tweets_tablename TEXT,
    nickname TEXT,
    unfollowed BOOLEAN not null default false
  `,
  schemaMyTweets: () => `
    tweet TEXT,
    tweet_id INT GENERATED ALWAYS AS IDENTITY,
    in_replyto_table TEXT,
    in_replyto_id TEXT,
    created_at BIGINT
  `,
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
      '${escapeText(params.tweet)}',
      '${params.replyToTable || ''}',
      '${params.replyToId || ''}',
      '${newSqlDate()}'
    );
  `,
  findFollowers: (address, myAddress) => `
    SELECT * FROM ${allUsersTable} WHERE user_address LIKE '${address}%';
  `,
  updateNickname: (params) => `
    UPDATE ${params.followTable} SET nickname = '${escapeText(params.nickname)}' WHERE account_address = '${params.account}';
  `,
  addFollower: (params) => `
    INSERT INTO ${params.table} (
      account_address,
      tweets_tablename,
      nickname
    ) VALUES (
      '${params.user_address}',
      '${params.tweets_tablename}',
      '${params.nickname ? escapeText(params.nickname) : ''}'
    );
  `
};
