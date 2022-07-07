import { run, ethers, network } from "hardhat";
import { deployments } from "../hardhat.config";

async function main() {
  console.log(`\nVerifying on '${network.name}'...`);

  const deployed = deployments[network.name];
  if (!deployed) throw new Error(`You have not deployed to ${network.name} yet`);

  // Verify implementation
  await run("verify:verify", {
    address: deployed,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
