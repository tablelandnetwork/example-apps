const { deployChessPolicy } = require("./deployments");

const tokenAddress = // Add address here

async function main() {
  await deployChessPolicy(tokenAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((err) => {
  console.error(err);
  process.exit(1);
});
