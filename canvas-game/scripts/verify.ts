import { run, ethers, network } from "hardhat";
import { proxies, ProxyAddresses } from "@tableland/evm/proxies";
import { deployments } from "../hardhat.config";

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
