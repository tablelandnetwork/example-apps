const { network, baseURI, appURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");


const tokenAddress = "0xC5bAB640203Add5e28c01975De53758240354f8d";
const setAppUri = async function () {
  const accounts = await hre.ethers.getSigners();
  const account = network.name === "localhost" ? accounts[1] : accounts[0];

  const ChessToken = await hre.ethers.getContractAt("ChessToken", tokenAddress);
  
  const contract = await ChessToken.connect(account);

  const tx = await contract.setAppBaseURI(appURI);
  await tx.wait();

  console.log("App Base URI:", appURI);
};

setAppUri().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});