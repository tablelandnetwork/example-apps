import { connect } from '@tableland/sdk';
import { Wallet, providers } from 'ethers';

const allUsersTable = 'gila_all_users_5_16';
const network = {
  chain: 'ethereum-goerli' // 'local-tableland'
};


// This is a bare bones script that will add an address to the
// table that keeps a reference to all the accounts using gila
const addAccount = async function () {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    // We also need an RPC provider to connect to
    const provider = new providers.AlchemyProvider('goerli', process.env.ALCHEMY_KEY);
    const signer = wallet.connect(provider);
    const tableland = await connect({ ...network, signer });

    const account = process.env.ACCOUNT;
    const tweetsTable = process.env.TWEETS;
    const followTable = process.env.FOLLOW;

    if (!account) throw new Error('must provide an account');
    if (!tweetsTable) throw new Error('must provide a tweets table');
    if (!followTable) throw new Error('must provide a follow table');

    const res = tableland.query(`
      INSERT INTO ${allUsersTable} (
        user_address,
        tweets_tablename,
        followers_tablename,
        account_enabled
      ) VALUES (
        '${account}',
        '${tweetsTable}',
        '${followTable}',
        true
      );`);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const disableAccount = async function () {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    // We also need an RPC provider to connect to
    const provider = new providers.AlchemyProvider('rinkeby', process.env.ALCHEMY_KEY);
    const signer = wallet.connect(provider);
    const tableland = await connect({ ...network, signer });

    const account = process.env.ACCOUNT;

    if (!account) throw new Error('must provide an account');

    const res = tableland.write(`
      UPDATE ${allUsersTable}
        SET account_enabled = false
        WHERE user_address = '${account}';
    `);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Only ever have to run this once.  This will create the gila user's table that
// will serve as a reference for all of the people using gila.
// NOTE:  This was run on Rinkeby on 4/12/2022 with v0.0.1 sdk and the table is `gila_all_users_680`
// REF: the owner of this table has nickname Account 6 (0x8411c7D4c1129FFFaC070C3cE8c824f889ec0D64) -JW

// NOTE:  This was run on Goerli on 6/20/2022 and the table is `gila_all_users_5_16`
// REF: the owner of this table has nickname Gila Owner (0x0751209b0180D28B2294FBeb65a048128585744f) -JW

const initialize = async function () {
  try {
    // need to supply a private key to setup a wallet
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    // We also need an RPC provider to connect to
    const provider = new providers.AlchemyProvider('goerli', process.env.ALCHEMY_KEY);
    const signer = wallet.connect(provider);
    const tableland = await connect({ ...network, signer });
console.log('connected')
    const createRes = await tableland.create(`
        user_address text primary key,
        tweets_tablename text,
        followers_tablename text,
        account_enabled boolean
      `,
      'gila_all_users'
    );

    console.log(createRes);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

initialize();
//addAccount();
