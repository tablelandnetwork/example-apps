const { network, ethers } = require("hardhat");
const chessToken = require('../artifacts/contracts/ChessToken.sol/ChessToken.json');
const tokenAbi = chessToken.abi;

const TOKEN_CONTRACT_ADDRESS = '0x71C95911E9a5D330f4D621842EC243EE1343292e';

const get = async function () {
  const isLocalhost = network.name === "localhost";
  const accounts = await hre.ethers.getSigners();
  const account = isLocalhost ? accounts[1] : accounts[0];

  const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, account);

  let gameId = 0;
  if (isLocalhost) {
    const tx = await tokenContract.mintGame(account.address, accounts[8].address, accounts[9].address);
    const receipt = await tx.wait();

    const [transferEvent] = receipt.events ?? [];
    gameId = transferEvent.args.tokenId.toNumber();
    console.log(gameId);
  }

  const uri = await tokenContract.tokenURI(gameId);

  console.log("Chess Token 0 URI is:", uri);

};

get().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});