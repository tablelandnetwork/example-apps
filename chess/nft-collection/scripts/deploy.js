// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [account0, account1] = await hre.ethers.getSigners();
  // for active networks we need to deploy with the first account, which is specified in config
  //const account = account0;
  // for local dev we need to deploy with an account that is different than the one the validator is using
  const account = account1;

  const GameToken = await hre.ethers.getContractFactory("GameToken");

  const gameToken = await GameToken.connect(account).deploy();

  await gameToken.deployed();

  console.log("GameToken deployed to:", gameToken.address, "By account: ", account.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((err) => {
  console.error(err);
  process.exit(1);
});
