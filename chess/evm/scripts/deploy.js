const { network, baseURI, appURI } = require("hardhat");
const { proxies } = require("@tableland/evm/proxies.js");


const deploy = async function () {
  const registryAddress = network.name === "localhost" ? "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" : proxies[network.name];
  if (!registryAddress) throw new Error("cannot deploy without an existing Tableland Registry Address");
  // for active networks we need to deploy with the first account, which is specified in config
  // for local dev we need to deploy with an account that is different than the one the validator is using
  const accounts = await hre.ethers.getSigners();
  const account = network.name === "localhost" ? accounts[1] : accounts[0];

  console.log("--- Starting to deploy the full chess app ---");
  console.log("Using Registry Address:", registryAddress);
  console.log("Using Account:", account.address);

  const chessTablelandLib = await deployChessTableland(account);

  const chessToken = await deployChessToken(account, chessTablelandLib, registryAddress);
  // wait 1 minute to avoid a REPLACEMENT_UNDERPRICED error
  // see https://docs.ethers.io/v5/troubleshooting/errors/#help-REPLACEMENT_UNDERPRICED
  await new Promise((resolve) => {
    setTimeout(() => resolve(), 60000)
  });

  const chessPolicy = await deployChessPolicy(account, chessTablelandLib, chessToken);
  await setChessPolicy(chessToken, chessPolicy);
  console.log("--- All done ~O8> ---");
};

// Deploy the library that will handle all of the calls to the Tableland Registry
const deployChessTableland = async function (account, exists) {
  if (exists) {
    const ChessTablelandLib = await hre.ethers.getContractAt("ChessTableland", exists);
    const chessTablelandLib = await ChessTablelandLib.connect(account);

    return chessTablelandLib;
  }
  // To reduce contract size we leverage a library for all Tablaland interactions
  // NOTE: is your contract is small enough you wouldn't need to use this approach
  const ChessTablelandLib = await hre.ethers.getContractFactory("ChessTableland");
  const chessTablelandLib = await ChessTablelandLib.connect(account).deploy();
  await chessTablelandLib.deployed();
  console.log("Chess Tableland deployed to:", chessTablelandLib.address, "By account:", account.address);

  return chessTablelandLib;
};

const deployChessToken = async function (account, chessTablelandLib, registryAddress, exists) {
  if (exists) {
    const ChessToken = await hre.ethers.getContractAt("ChessToken", exists);
    const chessToken = await ChessTablelandLib.connect(account);

    return chessToken;
  }

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

  return chessToken;
};

const deployChessPolicy = async function (account, chessTablelandLib, chessToken) {

  const ChessPolicy = await hre.ethers.getContractFactory("ChessPolicy", {
    libraries: {
      ChessTableland: chessTablelandLib.address
    }
  });
  const chessPolicy = await ChessPolicy.connect(account).deploy(chessToken.address);
  await chessPolicy.deployed();

  console.log("Chess Policy deployed to:", chessPolicy.address, "By account:", account.address);

  return chessPolicy;
};

const setChessPolicy = async function (chessToken, chessPolicy) {
  // Set the policy contract for the token table
  await chessToken.initSetController(chessPolicy.address);
  console.log("Policy has been set as the token table controller");
};

deploy().then(() => {
  console.log("success");
}).catch(err => {
  console.log(err);
});