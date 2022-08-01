const { network, baseURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");

const tablelandNetwork = network.name === "localhost" ? "local-tableland" : network.name;
const registryAddress = proxies[tablelandNetwork];
// for active networks we need to deploy with the first account, which is specified in config
// for local dev we need to deploy with an account that is different than the one the validator is using
const [account0, account1] = await hre.ethers.getSigners();
const account = network.name === "localhost" ? account1 : account0;

const deploy = async function () {

  const ChessToken = await hre.ethers.getContractFactory("ChessToken");
  const chessToken = await ChessToken.connect(account).deploy(baseURI, registryAddress);
  await chessToken.deployed();

  console.log("ChessToken deployed to:", chessToken.address, "By account: ", account.address);

  await exports.deployChessPolicy(token.address);

  const ChessPolicy = await hre.ethers.getContractFactory("ChessPolicy");
  const chessPolicy = await ChessPolicy.connect(account).deploy(tokenAddress);
  await chessPolicy.deployed();

  console.log("Chess Policy deployed to:", chessPolicy.address, "By account:", account.address);


};

deploy().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});