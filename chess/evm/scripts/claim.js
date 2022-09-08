const { network, baseURI, appURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");

const gameId = 0;
const tokenAddress = "fixme";
const claim = async function () {
  const accounts = await hre.ethers.getSigners();
  const account = network.name === "localhost" ? accounts[1] : accounts[0];

  const ChessToken = await hre.ethers.getContractAt("ChessToken", tokenAddress);
  
  const contract = await ChessToken.connect(account);

  const game = await contract.getGame(gameId);
console.log(game);
  const tx = await contract.claimBounty(gameId);
  await tx.wait();

  console.log(account.address, "has claimed bounty");
};

claim().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});