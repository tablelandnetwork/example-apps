const fetch = require('node-fetch');

globalThis.fetch = fetch;

const { connect } = require('@tableland/sdk');
const { TablelandTables__factory } = require("@tableland/eth");
const { Wallet, providers } = require('ethers');

const registryContractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

const go = async function () {
    const wallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' /* Hardhat #0 privkey */);
    //const wallet = new Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' /* Hardhat #1 privkey */);
    const provider = new providers.JsonRpcProvider('http://localhost:8545');

    //const wallet = new Wallet('ec868f5856ff3d91ac8036770733fbfc1e7709d172f3d5014b08549e565a75ff' /* Account 4 metamask */);
    //const provider = new providers.AlchemyProvider('optimism-kovan', 'z2oBvo9OJMrSF62BoSBOgjeV-jfEeU8U');
    //const provider = new providers.AlchemyProvider('rinkeby', 'z2oBvo9OJMrSF62BoSBOgjeV-jfEeU8U');

    const signer = wallet.connect(provider);

    try {
        //await connect({signer: signer, network: 'optimism-kovan-staging', host: 'https://staging.tableland.network'});
        const tableland = await connect({signer: signer, network: 'local', host: 'http://localhost:8080'});
        const registryContract = TablelandTables__factory.connect(registryContractAddress, signer);


        const txn = await tableland.create(`CREATE TABLE chess (
          player_address TEXT,
          game_id TEXT,
          move_id SERIAL,
          move TEXT
        );`);
        console.log(txn.transactionHash);
        const receipt = await tableland.receipt(txn.transactionHash);
        console.log(`receipt: ${JSON.stringify(receipt, null, 4)}`);

        // TODO: local Validator only sees events after a second event is emitted, but I think this will be `receipt.tableId` or something
        const tableId = 0;

        registryContract.setController(
          '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' /* Hardhat #0 pubkey */,
          tableId,
          '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0' /* Chess contract address */
        );

    } catch (err) {
        console.log(err);
    }
};

go();
