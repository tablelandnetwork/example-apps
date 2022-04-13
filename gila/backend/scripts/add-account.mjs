import { connect } from '@tableland/sdk';
import { Wallet, providers } from 'ethers';


const network = {
  network: 'testnet',
  host: 'https://testnet.tableland.network'
};


// This is a bare bones script that will add an address to the
// table that keeps a reference to all the accounts using gila
const addAccount = async function () {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    // We also need an RPC provider to connect to
    const provider = new providers.AlchemyProvider('rinkeby', process.env.ALCHEMY_KEY);
    const signer = wallet.connect(provider);
    const tableland = await connect({ ...network, signer });

    const account = process.env.ACCOUNT;
    const tweetsTable = process.env.TWEETS;
    const followTable = process.env.FOLLOW;

    if (!account) throw new Error('must provide an account');
    if (!tweetsTable) throw new Error('must provide a tweets table');
    if (!followTable) throw new Error('must provide a follow table');

    const res = tableland.query(`
      INSERT INTO gila_all_users_680 (
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

    const res = tableland.query(`
      UPDATE gila_all_users_680
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
// NOTE:  This was run on Rinkeby on 4/12/2022 and the table is `gila_all_users_680`
// REF: the owner of this table has nickname Account 6 -JW
const initialize = async function () {
  try {
    // Since we don't have Metamask, you need to supply a private key directly
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    // We also need an RPC provider to connect to
    const provider = new providers.AlchemyProvider('rinkeby', process.env.ALCHEMY_KEY);
    const signer = wallet.connect(provider);
    const tableland = await connect({ ...network, signer });

    const createRes = await tableland.create(
      `CREATE TABLE gila_all_users (
        user_address text primary key,
        tweets_tablename text,
        followers_tablename text,
        account_enabled boolean
      );`
    );

    const queryableName = createRes.name;
    console.log(queryableName);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

initialize();
//addAccount();
