// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { connect } = require("@tableland/sdk");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [account0, account1] = await hre.ethers.getSigners();
  // for active networks we need to deploy with the first account, which is specified in config
  //const account = account0;
  // for local dev we need to deploy with an account that is different than the one the validator is using
  const account = account1;

  //const tableland = await connect({
    //chain: 'ethereum-goerli',
    //signer: account
  //});
  const tableland = await connect({
    chain: "local-tableland",
    signer: account
  });

  if (!(tableland.options && tableland.options.host)) {
    throw new Error("Must have a host to set set base uri");
  }
  const host = tableland.options.host;

  const GameToken = await hre.ethers.getContractFactory("GameToken");

  const gameToken = await GameToken.connect(account).deploy();

  await gameToken.deployed();

  console.log("GameToken deployed to:", gameToken.address, "By account: ", account.address);

  const { name } = await tableland.create(`
    id int,
    name text,
    description text,
    image text,
    external_url text,
    animation_url text,
    attributes json
  `, {
    prefix: "chess_nft"
  });

  console.log("Tableland Table created:", name);

  // TODO: this should be env
  // https://staging.tableland.network/query?s=select json_build_object('name', concat('#', id), 'external_url', concat('https://tableland.xyz/rigs/', id), 'image', image, 'image_alpha', image_alpha, 'attributes',  json_agg(json_build_object('display_type', display_type, 'trait_type', trait_type, 'value', value))) from test_rigs_69_5 join test_rig_attributes_69_6 on test_rigs_69_5.id = test_rig_attributes_69_6.rig_id where id = 1 group by id;&mode=list
  gameToken.setBaseUri(`${host}/chain/31337/tables`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((err) => {
  console.error(err);
  process.exit(1);
});
