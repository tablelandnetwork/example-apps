const { deployChessToken } = require("./deployments");

async function main() {
  await deployChessToken();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((err) => {
  console.error(err);
  process.exit(1);
});
