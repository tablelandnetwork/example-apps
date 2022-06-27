const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");


describe("Chess", function () {
  let accounts;
  let gameTokens;
  let chess;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const NftFactory = await ethers.getContractFactory("GameToken");
    gameTokens = await NftFactory.deploy();
    await gameTokens.deployed();

    const ControllerFactory = await ethers.getContractFactory("Chess");
    chess = await ControllerFactory.deploy(gameTokens.address);
    await chess.deployed();
  });

  const getGame = async function () {
    const [account0, account1, account2] = accounts;

    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    expect(gameId instanceof BigNumber).to.equal(true);

    return gameId;
  };

  it("Should return a policy for the caller", async function () {
    const [account0, account1] = accounts;
    const gameId1 = await getGame();
    const gameId2 = await getGame();

    const controller = await chess.connect(account0).getPolicy(account1.address);

    expect(
      controller.toString()
    ).to.equal(
      `true,false,false,player_address = ${account1.address.toLowerCase()} AND game_id IN ('${gameId1}', '${gameId2}'),,`
    );

  });

  it("Should change policy based on caller active games", async function () {
    const [account0, account1] = accounts;
    const gameId1 = await getGame();
    const gameId2 = await getGame();

    const controller = await chess.connect(account0).getPolicy(account1.address);

    expect(
      controller.toString()
    ).to.equal(
      `true,false,false,player_address = ${account1.address.toLowerCase()} AND game_id IN ('${gameId1}', '${gameId2}'),,`
    );

    const winnerTx = await gameTokens
      .connect(account0)
      .setWinner(gameId1, account1.address);

    await winnerTx.wait()

    const controller2 = await chess.connect(account0).getPolicy(account1.address);

    expect(
      controller2.toString()
    ).to.equal(
      `true,false,false,player_address = ${account1.address.toLowerCase()} AND game_id IN ('${gameId2}'),,`
    );
  });

});
