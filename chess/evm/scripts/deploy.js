const { network, baseURI, appURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");


const deploy = async function () {
  const registryAddress = network.name === "localhost" ? "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" : proxies[network.name];
  // for active networks we need to deploy with the first account, which is specified in config
  // for local dev we need to deploy with an account that is different than the one the validator is using
  const accounts = await hre.ethers.getSigners();
  const account = network.name === "localhost" ? accounts[1] : accounts[0];

  // To reduce contract size we leverage a library for all Tablaland interactions
  // NOTE: is your contract is small enough you wouldn't need to use this approach
  const ChessTablelandLib = await hre.ethers.getContractFactory("ChessTableland");
  const chessTablelandLib = await ChessTablelandLib.connect(account).deploy();
  await chessTablelandLib.deployed();
  console.log("Chess Tableland deployed to:", chessTablelandLib.address, "By account:", account.address);

  const ChessToken = await hre.ethers.getContractFactory("ChessToken", {
    libraries: {
      // Pass in library deployment address
      // NOTE: if we are deploying to a public chain (not localhost) we
      //       could use the address of an already deployed library
      ChessTableland: chessTablelandLib.address
    }
  });
  console.log("app uri", appURI);
  const chessToken = await ChessToken.connect(account).deploy(baseURI, registryAddress, appURI);
  await chessToken.deployed();
  await chessToken.initCreate();

  console.log("Chess Token deployed to:", chessToken.address, "By account:", account.address);

  const ChessPolicy = await hre.ethers.getContractFactory("ChessPolicy");
  const chessPolicy = await ChessPolicy.connect(account).deploy(chessToken.address);
  await chessPolicy.deployed();

  console.log("Chess Policy deployed to:", chessPolicy.address, "By account:", account.address);

  await chessToken.initSetController(chessPolicy.address);
};

deploy().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});