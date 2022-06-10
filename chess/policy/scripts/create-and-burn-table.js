const fetch = require('node-fetch');

globalThis.fetch = fetch;

const { connect } = require('@tableland/sdk');
const { TablelandTables__factory } = require("@tableland/eth");
const { Wallet, providers } = require('ethers');

const registryContractAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
const policyContractAddress = '0x8464135c8F25Da09e49BC8782676a84730C318bC';

/*
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Account #4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

Account #5: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc (10000 ETH)
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba

Account #6: 0x976EA74026E726554dB657fA54763abd0C3a0aa9 (10000 ETH)
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e

Account #7: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955 (10000 ETH)
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356

Account #8: 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f (10000 ETH)
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

Account #9: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 (10000 ETH)
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

Account #10: 0xBcd4042DE499D14e55001CcbB24a551F3b954096 (10000 ETH)
Private Key: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897

Account #11: 0x71bE63f3384f5fb98995898A86B02Fb2426c5788 (10000 ETH)
Private Key: 0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82

Account #12: 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a (10000 ETH)
Private Key: 0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1

Account #13: 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec (10000 ETH)
Private Key: 0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd

Account #14: 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097 (10000 ETH)
Private Key: 0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa

Account #15: 0xcd3B766CCDd6AE721141F452C550Ca635964ce71 (10000 ETH)
Private Key: 0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61

Account #16: 0x2546BcD3c84621e976D8185a91A922aE77ECEc30 (10000 ETH)
Private Key: 0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0

Account #17: 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E (10000 ETH)
Private Key: 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd

Account #18: 0xdD2FD4581271e230360230F9337D5c0430Bf44C0 (10000 ETH)
Private Key: 0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0

Account #19: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199 (10000 ETH)
Private Key: 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e
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
        const tableland = await connect({signer: signer, network: 'localhost', host: 'http://localhost:8080'});

        const tableId = await create(tableland);

        await setController(tableId, signer, address);

        await burnIt(tableId, signer, address);

        //await tableland.write(`insert into chess_31337_${tableId} (player_address, game_id, move) VALUES ('${'Not an address'}', 'game1', 'account 3 pawn');`)


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
  const tableId = receipt.tableId;
  if (!tableId) throw new Error('could not get table ID');

  return tableId;
};

const burnIt = async function (tableId, signer, address) {
  const registryContract = TablelandTables__factory.connect(registryContractAddress, signer);

  const burnTx = await registryContract.transferFrom(
    address,
  //'0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097'
    '0x000000000000000000000000000000dead7ab1e2',
    tableId,
  );

  await burnTx.wait();
};

go();
