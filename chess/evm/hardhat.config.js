const { extendEnvironment } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
const dotenv = require("dotenv");

dotenv.config();


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.13",
  networks: {
    // mainnets
    ethereum: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${
        process.env.ETHEREUM_API_KEY ?? ""
      }`,
      accounts:
        process.env.ETHEREUM_PRIVATE_KEY !== undefined
          ? [process.env.ETHEREUM_PRIVATE_KEY]
          : [],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${
        process.env.OPTIMISM_API_KEY ?? ""
      }`,
      accounts:
        process.env.OPTIMISM_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_PRIVATE_KEY]
          : [],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${
        process.env.POLYGON_API_KEY ?? ""
      }`,
      accounts:
        process.env.POLYGON_PRIVATE_KEY !== undefined
          ? [process.env.POLYGON_PRIVATE_KEY]
          : [],
    },
    // testnets
    "ethereum-goerli": {
      url: `https://eth-goerli.alchemyapi.io/v2/${
        process.env.ETHEREUM_GOERLI_API_KEY ?? ""
      }`,
      accounts:
        process.env.ETHEREUM_GOERLI_PRIVATE_KEY !== undefined
          ? [process.env.ETHEREUM_GOERLI_PRIVATE_KEY]
          : [],
    },
    "optimism-kovan": {
      url: `https://opt-kovan.g.alchemy.com/v2/${
        process.env.OPTIMISM_KOVAN_API_KEY ?? ""
      }`,
      accounts:
        process.env.OPTIMISM_KOVAN_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_KOVAN_PRIVATE_KEY]
          : [],
    },
    "polygon-mumbai": {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${
        process.env.POLYGON_MUMBAI_API_KEY ?? ""
      }`,
      accounts:
        process.env.POLYGON_MUMBAI_PRIVATE_KEY !== undefined
          ? [process.env.POLYGON_MUMBAI_PRIVATE_KEY]
          : [],
    },
    // devnets
    "optimism-kovan-staging": {
      url: `https://opt-kovan.g.alchemy.com/v2/${
        process.env.OPTIMISM_KOVAN_STAGING_API_KEY ?? ""
      }`,
      accounts:
        process.env.OPTIMISM_KOVAN_STAGING_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_KOVAN_STAGING_PRIVATE_KEY]
          : [],
    }
  },
  baseURIs: {
    // mainnets
    ethereum: "https://tableland.network/query?s=",
    optimism: "https://tableland.network/query?s=",
    polygon: "https://tableland.network/query?s=",
    // testnets
    "ethereum-goerli": "https://testnet.tableland.network/query?s=",
    "optimism-kovan": "https://testnet.tableland.network/query?s=",
    "polygon-mumbai": "https://testnet.tableland.network/query?s=",
    // devnets
    "optimism-kovan-staging":
      "https://staging.tableland.network/query?s=",
    localhost: "http://localhost:8080/query?s=",
  },
  appURIs: {
    // mainnets
    ethereum: "fixme",
    optimism: "fixme",
    polygon: "fixme",
    // testnets
    "ethereum-goerli": "fixme",
    "optimism-kovan": "fixme",
    "polygon-mumbai": "https://d49bgqk3gxy9r.cloudfront.net/",
    // devnets
    "optimism-kovan-staging": "fixme",
    localhost: "http://localhost:3000/",
  }
};


extendEnvironment(hre => {
  // Get base URI for user-selected network
  const baseUris = hre.userConfig.baseURIs;
  hre.baseURI = baseUris[hre.network.name];

  const appUris = hre.userConfig.appURIs;
  hre.appURI = appUris[hre.network.name];
});
