# Tableland Chess NFT

Herein lies an example use of Tableland's on-chain ACL to build an NFT and game application.

## Overview

There are two main parts of this application, a Svelte app and an NFT.
The Svelte app has the responsibility of enabling minting Chess NFTs, which **are** a chess game.  This app is how games are played and it's also the `animation_url` metadata uri. This means that the NFT itself is a view of the game. If you want to see this in action checkout [Game 0 on Opensea](https://testnets.opensea.io/assets/mumbai/0xd96b8ef04ffe58afb6a7acd840dd1954d3435050/0), or look at [Game 0 in the App](https://d49bgqk3gxy9r.cloudfront.net/?white=0x1Ba0D9DdC122351316Ba663c2148269b32AA052c&black=0x117e46D40eC17e7Aa2C68A0B923387f5De4e6B4E&game=0).  __note that to view the game in the app you need a browser that has a wallet connected to polygon-mumbai__
The NFT is based on the ERC-721 standard, and the metadata follows the [Opensea standard](https://docs.opensea.io/docs/metadata-standards).  The metadata also leverages **Tableland to create mutable metadata with on chain Access Control Logic** defined in a Smart Contract. In Tableland this kind of ACL is referred to as a Policy Contract. For the chess game the Policy Contract ensures that game data can only be inserted by the players of the given game, and once a game has a certified winner no more moves can be made.

### NFT

For some context, each game is an ERC-721 compliant NFT that has been extended to include four additional properties.

 1. player1
 2. player2
 3. winner
 4. bounty

`player1` and `player2` are the addresses of those players.  `winner` is the game's winner, more on this later. Lastly `bounty` is an optional amount of coin that the winner will be able to claim.  When someone wants to "make a move"(insert a row into the chess moves table) in a Tableland Chess game, the Policy Contract will first check that the address trying to make the move is a player of that game and that the game is active.  If they are not a player, or the game already has a winner the insert will not be allowed.
**Note on the idea of a winner:** Since the game is an NFT, along with players, it has an **owner**.  The owner is the address that minted the game.  The owner can indicate who the winner is.  Once there is a winner, that addres can claim the games bounty if any has been added to the game. Because of the potential conflict of interests, the owner can only be a player if there is no bounty There is also an opportunity for either of the players to concede the game, at which time the other player will be set to the winner.

The related code can be found in the [evm](https://github.com/tablelandnetwork/example-apps/tree/main/chess/evm) directory

### App

The app has been built using Svelte, and is served as a static webpage that connects to Tableland via the [Tableland SDK](https://github.com/tablelandnetwork/js-tableland).  Most of the related code can be found in the [src](https://github.com/tablelandnetwork/example-apps/tree/main/chess/src) directory.  The application is also responsible for providing the content of the `animation_url` metadata property.  Because of this, you can see the game's moves palyed in a loop on opensea.

# Deployments

### Polygon Mumbai

NFT contract address: [0xc5bab640203add5e28c01975de53758240354f8d](https://mumbai.polygonscan.com/address/0xc5bab640203add5e28c01975de53758240354f8d)
Opensea: [chesstoken](https://testnets.opensea.io/collection/chesstoken-ltbmvkhlok)


# Developers

**Running the app as a dev:**
```bash
npm install
npm run dev
```

**Build the app:**
Update the .env file with the details of your contract deployment and tableland tables. See the [example .env](https://github.com/tablelandnetwork/example-apps/tree/main/chess/.env.example) file for details
```bash
npm install
npm run build
```
The output of the build will be in the [public/](https://github.com/tablelandnetwork/example-apps/tree/main/chess/public) directory

**Working with the contract:**
First ensure you have updated [hardhat.config.js](https://github.com/tablelandnetwork/example-apps/tree/main/chess/hardhat.config.js) with the details of your deployment, and you have a .env file ready in the evm directory. See the [example .env](https://github.com/tablelandnetwork/example-apps/tree/main/chess/evm/.env.example) file for details

```bash
cd evm
npm install
npx hardhat run --network <network of choice> scripts/deploy.js
````

set the app baseUri:
```bash
npx hardhat run --network <network of choice> scripts/set-app-uri.js
````

# Contributing

PRs accepted.
For any bugs open an issue.
If asking questions on stackoverflow please use the tag `tableland`.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

