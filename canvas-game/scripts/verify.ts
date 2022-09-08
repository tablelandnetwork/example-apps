import { run, ethers, network } from "hardhat";
import { proxies, ProxyAddresses } from "@tableland/evm/proxies";
import { deployments } from "../hardhat.config";


/*
 *  TODO: this isn't working, but the shell commands below were used
 *
 *        npx hardhat --network polygon-mumbai verify "0x2C3A7bECa46FBB35FFbB2C29947e610EB6A6cEAE" "0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68"
 *        npx hardhat --network ethereum-goerli verify "0x4035ce0Df8440bd07BEf39306e4a8D785C0e13a1" "0xDA8EA22d092307874f30A1F277D1388dca0BA97a"
 */

async function main() {
  console.log(`\nVerifying on '${network.name}'...`);

  const deployed = deployments[network.name];
  if (!deployed) throw new Error(`You have not deployed to ${network.name} yet`);
  const registryAddress = (proxies as ProxyAddresses)[network.name];
  // Verify implementation
  await run("verify:verify", [registryAddress], {
    address: deployed,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
