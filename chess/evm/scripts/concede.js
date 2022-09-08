const { network, baseURI, appURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");

const gameId = 0;
const tokenAddress = "fixme";
const concede = async function () {
  const accounts = await hre.ethers.getSigners();
  const account = network.name === "localhost" ? accounts[1] : accounts[0];

  const ChessToken = await hre.ethers.getContractAt("ChessToken", tokenAddress);
  
  const tx = await ChessToken.connect(account).concede(gameId);
  await tx.wait();

  console.log(account.address, "has conceded");
};

concede().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});