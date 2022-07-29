const fetch = require('node-fetch');

globalThis.fetch = fetch;

const { connect } = require('@tableland/sdk');
const { TablelandTables__factory } = require("@tableland/eth");
const { Wallet, providers } = require('ethers');

// WARN: uncomment addresses per your network needs
// Görli
//const registryContractAddress = '0xa4b0729f02C6dB01ADe92d247b7425953d1DbA25';
// Local
const registryContractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const policyContractAddress = '0x8464135c8F25Da09e49BC8782676a84730C318bC';

const go = async function () {
    try {
        const [account0, account1] = await hre.ethers.getSigners();
        // public networks we use account 0 per the config
        //const account = account0;
        // using account 1 for hardhat since validator is using account 0
        const account = account1;

        // WARN: uncomment connection per your network needs
        //const tableland = await connect({
          //signer: account,
          //chain: 'ethereum-goerli'
        //});
        const tableland = await connect({
          signer: account,
          chain: 'local-tableland'
        });

        const { tableId, name: tableName } =  await tableland.create(
          // NOTE: move_id SERIAL will mean moves are incremented relative to all games.
          //       To order moves for a single game the app can sort, but the number will not
          //       be the move number for that game.  This saves us from needing more constraints,
          //       and tracking what the move number is in the app.
          `
            player_address VARCHAR(100),
            game_id VARCHAR(20),
            move_id SERIAL,
            move TEXT
          `, {
            prefix: 'chess'
          }
        );
        await tableland.setController(policyContractAddress, tableName);
        await tableland.lockController(tableName);

    } catch (err) {
        console.log(err);
    }
};

go();
