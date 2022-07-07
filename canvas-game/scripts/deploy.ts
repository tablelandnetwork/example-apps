// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, network } from "hardhat";
import config from "../hardhat.config";
import { proxies, ProxyAddresses } from "@tableland/evm/proxies";
import { deployments } from "../hardhat.config";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const deployed = deployments[network.name];
  if (deployed) throw new Error(`Already deployed to ${network.name}`);

  const registryAddress = (proxies as ProxyAddresses)[network.name];

  if (!registryAddress) throw new Error("cannot get registry address for " + network.name);

  const CanvasGame = await ethers.getContractFactory("CanvasGame");
  const canvasGame = await CanvasGame.deploy(
    registryAddress,
    "projectName",
    "projectDescription",
    "projectImage",
    "projectLink"
  );
  await canvasGame.deployed();

  console.log("deployed to:", canvasGame.address, "on", network.name);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
