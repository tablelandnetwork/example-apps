const fetch = require('node-fetch');

globalThis.fetch = fetch;

const { connect } = require('@tableland/sdk');
const { TablelandTables__factory } = require("@tableland/eth");
const { Wallet, providers } = require('ethers');

const registryContractAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
const policyContractAddress = '0x8464135c8F25Da09e49BC8782676a84730C318bC';

/*
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Account #3: 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
*/

const go = async function () {
    try {
        const provider = new providers.JsonRpcProvider('http://localhost:8545');
        //const provider = new providers.AlchemyProvider('optimism-kovan', 'z2oBvo9OJMrSF62BoSBOgjeV-jfEeU8U');
        //const provider = new providers.AlchemyProvider('rinkeby', 'z2oBvo9OJMrSF62BoSBOgjeV-jfEeU8U');

        //const wallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' /* Hardhat #0 privkey */);
        //const wallet = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' /* Hardhat #1 privkey */);
        //const wallet = new Wallet('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a' /* Hardhat #2 privkey */);
        const wallet = new Wallet('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6' /* Hardhat #3 privkey */);
        //const wallet = new Wallet('ec868f5856ff3d91ac8036770733fbfc1e7709d172f3d5014b08549e565a75ff' /* Account 4 metamask */);

        const signer = wallet.connect(provider);
        const address = await signer.getAddress();

        //await connect({signer: signer, network: 'optimism-kovan-staging', host: 'https://staging.tableland.network'});
        const tableland = await connect({signer: signer, network: 'local', host: 'http://localhost:8080'});

        const tableId = 1;//await create(tableland);

        //await setController(tableId, signer, address);

        await tableland.write(`insert into chess_31337_${tableId} (player_address, game_id, move) VALUES ('${'Not an address'}', 'game1', 'account 3 pawn');`)


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
    `player_address TEXT,
    game_id TEXT,
    move_id SERIAL,
    move TEXT`,
    // prefix
    'chess'
  );

  let receipt = await tableland.receipt(txn.transactionHash);
  let tries = 0;
  while (!receipt && tries < 5) {
    tries++;
    await new Promise(resolve => setTimeout(() => resolve(), 2000));
    receipt = await tableland.receipt(txn.transactionHash);
  }

  console.log(`receipt: ${JSON.stringify(receipt, null, 4)}`);
  const tableId = receipt.tableId;
  if (!tableId) throw new Error('could not get table ID');

  return tableId;
};

go();
