const fetch = require('node-fetch');

globalThis.fetch = fetch;

const { connect } = require('@tableland/sdk');
const { TablelandTables__factory } = require("@tableland/eth");
const { Wallet, providers } = require('ethers');

// Görli
const registryContractAddress = '0xa4b0729f02C6dB01ADe92d247b7425953d1DbA25';
const policyContractAddress = '0x6eb867eAA6aa22125f0bBe9Ec900F5B0Bb5b0927';

const go = async function () {
    try {
        const [account] = await hre.ethers.getSigners();

        //await connect({signer: signer, network: 'optimism-kovan-staging', host: 'https://staging.tableland.network'});
        const tableland = await connect({
          signer: account,
          chain: 'ethereum-goerli'
        });

        const tableId = 11;//await create(tableland);

        await setController(tableId, account, account.address);

        await burnIt(tableId, account, account.address);

    } catch (err) {
        console.log(err);
    }
};

const setController = async function (tableId, signer, address) {
  // Make some direct to registry sc calls
  const registryContract = TablelandTables__factory.connect(registryContractAddress, signer);

  const controllerTx = await registryContract.setController(
    address, /* table owner address */
    tableId,
    policyContractAddress /* Chess contract address */
  );

  await controllerTx.wait();
};

const create = async function (tableland) {
  const txn = await tableland.create(
    // NOTE: move_id SERIAL will mean moves are incremented relative to all games.
    //       To order moves for a single game the app can sort, but the number will not
    //       be the move number for that game.  This saves us from needing more constraints,
    //       and tracking what the move number is in the app.
    `player_address VARCHAR(100),
    game_id VARCHAR(20),
    move_id SERIAL,
    move TEXT`,
    // prefix
    'chess'
  );

  let receipt = await tableland.receipt(txn.txnHash);
  let tries = 0;
  while (!receipt && tries < 5) {
    tries++;
    await new Promise(resolve => setTimeout(() => resolve(), 2000));
    receipt = await tableland.receipt(txn.txnHash);
  }

  console.log(`receipt: ${JSON.stringify(receipt, null, 4)}`);
  const tableId = receipt && receipt.tableId;
  if (!tableId) throw new Error('could not get table ID');

  return tableId;
};

const burnIt = async function (tableId, signer, address) {
  const registryContract = TablelandTables__factory.connect(registryContractAddress, signer);

  const burnTx = await registryContract.transferFrom(
    address,
    '0x000000000000000000000000000000000000dead',
    tableId,
  );
  //const burnTx = await registryContract.lock(tableId);

  await burnTx.wait();

};

go();
