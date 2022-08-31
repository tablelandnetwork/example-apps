const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const validatorService = "http://localhost:8080";
const baseUri = validatorService + "/query?s=";
const appUri = "http://localhost:3000";

module.exports.appUri = appUri;
module.exports.baseUri = baseUri;

module.exports.deployAll = async function () {
  const RegistryFactory = await ethers.getContractFactory("TablelandTables");
  const registry = await RegistryFactory.deploy();
  await registry.deployed();
  await registry.initialize(validatorService);


  // To reduce contract size we leverage a library for all Tablaland interactions
  // NOTE: is your contract is small enough you wouldn't need to use this approach
  const ChessTablelandLib = await ethers.getContractFactory("ChessTableland");
  const chessTablelandLib = await ChessTablelandLib.deploy();
  await chessTablelandLib.deployed();


  const ChessTokenFactory = await ethers.getContractFactory("ChessToken", {
    libraries: {
      // Pass in library deployment address
      ChessTableland: chessTablelandLib.address
    }
  });
  const chessTokens = await ChessTokenFactory.deploy(baseUri, registry.address, appUri);
  await chessTokens.deployed();
  await chessTokens.initCreate();

  const ChessPolicyFactory = await ethers.getContractFactory("ChessPolicy", {
    libraries: {
      // Pass in library deployment address
      ChessTableland: chessTablelandLib.address
    }
  });
  const chessPolicy = await ChessPolicyFactory.deploy(chessTokens.address);
  await chessPolicy.deployed();

  await chessTokens.initSetController(chessPolicy.address);

  return { registry, chessTokens, chessPolicy };
}

module.exports.getGame = async function (chessTokens, accounts) {
  const [account0, account1, account2] = accounts;

  const tx = await chessTokens
    .connect(account0)
    .mintGame(account0.address, account1.address, account2.address);

  const receipt = await tx.wait();
  const [transferEvent] = receipt.events ?? [];
  const gameId = transferEvent.args.tokenId;

  expect(gameId instanceof BigNumber).to.equal(true);

  return gameId;
};
