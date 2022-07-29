const fetch = require('node-fetch');
global.fetch = fetch;

const { connect } = require('@tableland/sdk');
const { Wallet, providers, utils } = require('ethers');

const allUsersTable = 'gila_all_users_5_16';
const network = {
  chain: 'ethereum-goerli' // 'local-tableland'
};

exports.handler = async function (event) {
    const data = JSON.parse(event.body);
    const signer = utils.verifyMessage(data.message, data.signature);

    if (signer !== data.address) {
        return forbidden();
    }
console.log('message was signed');
    const res = await addAccount(data);
console.log(res);
console.log('done adding account');

    const response = {
        statusCode: 200,
        body: JSON.stringify('Success'),
    };
    return response;
};

const addAccount = async function (params) {
    try {
        const address = params.address;
        const tweetsTable = params.tweets;
        const followTable = params.follow;

        if (process.env.TEST) return;

        if (!address) throw new Error('must provide an address');
        if (!tweetsTable) throw new Error('must provide a tweets table');
        if (!followTable) throw new Error('must provide a follow table');

console.log('getting Wallet for Gila users table owner');

        const privateKey = process.env.PRIVATE_KEY;
        const wallet = new Wallet(privateKey);

        // We also need an RPC provider to connect to
        const provider = new providers.AlchemyProvider('goerli', process.env.ALCHEMY_KEY);
        const signer = wallet.connect(provider);

console.log('connecting to tableland');

        const tableland = await connect({ ...network, signer });

console.log('sending query to insert new user account');

        // NOTE: all users table table was createed ahead of time, via relevant script
        return await tableland.write(`
            INSERT INTO ${allUsersTable} (
                user_address,
                tweets_tablename,
                followers_tablename,
                account_enabled
            ) VALUES (
                '${address}',
                '${tweetsTable}',
                '${followTable}',
                true
            );`
        );
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const forbidden = function () {
    const response = {
        statusCode: 403,
        body: JSON.stringify('Forbidden')
    };
    return response;
}
