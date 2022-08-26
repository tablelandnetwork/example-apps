const { network, baseURI, appURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");

const gameId = 0;
const tokenAddress = "0x39f163909abd593A6c9fa76e77d3C9246C4AA32e";
const deploy = async function () {
  const accounts = await hre.ethers.getSigners();
  const account = network.name === "localhost" ? accounts[1] : accounts[0];

  const ChessToken = await hre.ethers.getContractAt("ChessToken", tokenAddress);
  
  const tx = await ChessToken.connect(account).concede(gameId);
  await tx.wait();

  console.log(account.address, "has conceded");
};

deploy().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});