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
          chain: 'custom',
          contract: registryContractAddress,
          host: 'http://localhost:8080'
        });

        const tableId = await create(tableland);
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

  const burnTx = await registryContract.lock(
    address,
    tableId,
  );
  //const burnTx = await registryContract.lock(tableId);

  await burnTx.wait();

};

go();
