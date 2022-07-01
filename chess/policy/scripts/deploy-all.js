const go = async function () {
  const [account0, account1] = await hre.ethers.getSigners();
  // for active networks we need to deploy with the first account, which is specified in config
  //const account = account0;
  // for local dev we need to deploy with an account that is different than the one the validator is using
  const account = account1;

  await deployChess(account);
};

const deployChess = async function (account) {
  const Chess = await hre.ethers.getContractFactory("Chess");
  const chess = await Chess.connect(account).deploy();
  await chess.deployed();

  console.log("Chess deployed to:", chess.address, "By account: ", account.address);

  return chess;
};

const deployNft = async function () {
  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.connect(account).deploy();

  await gameToken.deployed();

  console.log("GameToken deployed to:", gameToken.address, "By account: ", account.address);

  // TODO: this table is supposed to hold the metadata for the NFT.  All I really want is the
  //  animation_url to point to a fixed url host+path, but the querystring changes three query params
  //  based on the tokenId.  It occurs to me that having the `SC.tokenUri(tokenId)` function return
  //  json would be much easier and not that expensive.  What am I missing here?
  //  The reason we want the URI instead of the json is purely because we want opensea to show the
  //  game on the token's page.
  //  what about a simple 
  const createTx = await tableland.create("chess_nft", `
    id int,
    name text,
    description text,
    image text,
    external_url text,
    animation_url text,
    attributes json
  `);

  console.log("Tableland Table created: " + createTx);

  // TODO: this should be env
  // https://staging.tableland.network/query?s=select json_build_object('name', concat('#', id), 'external_url', concat('https://tableland.xyz/rigs/', id), 'image', image, 'image_alpha', image_alpha, 'attributes',  json_agg(json_build_object('display_type', display_type, 'trait_type', trait_type, 'value', value))) from test_rigs_69_5 join test_rig_attributes_69_6 on test_rigs_69_5.id = test_rig_attributes_69_6.rig_id where id = 1 group by id;&mode=list
  gameToken.setBaseUri(`http://localhost:8080/chain/31337/tables`);
}