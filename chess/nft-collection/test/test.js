const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const { BigNumber } = require("ethers");

describe("Chess Game NFT Contract", function () {
  let accounts;
  let gameTokens;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("GameToken");
    gameTokens = await Factory.deploy();
    await gameTokens.deployed();
  });

  // Test what it should do
  it("Should allow minting a games", async function () {
    const [account0, account1, account2] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    expect(gameId).to.equal(BigNumber.from(0));

    const tx2 = await gameTokens
      .connect(account1)
      .mintGame(account1.address, account0.address, account2.address);

    const receipt2 = await tx2.wait();
    const [transferEvent2] = receipt2.events ?? [];
    const gameId2 = transferEvent2.args.tokenId;

    expect(gameId2).to.equal(BigNumber.from(1));
  });

  it("Should allow getting games", async function () {
    const [account0, account1, account2] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    expect(gameId).to.equal(BigNumber.from(0));

    const game = await gameTokens
      .connect(account1)
      .getGame(gameId);

    // check that players are set
    expect(game.player1).to.equal(account1.address);
    expect(game.player2).to.equal(account2.address);

    // check that defaults are correct
    expect(game.conceded).to.equal(undefined);
    expect(game.winner).to.equal("0x0000000000000000000000000000000000000000");
    expect(game.balance).to.equal(0);
  });

  it("Should allow setting a game bounty", async function () {
    const [account0, account1, account2] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    expect(gameId).to.equal(BigNumber.from(0));

    const bountyTx = await gameTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("2")});

    await bountyTx.wait()

    const accnt0Balance = await hre.network.provider.send("eth_getBalance", [
      account0.address,
    ]);

    // Check that the account 0 balance is less then it's initial value minus the bounty
    // note that difference is the gas cost
    expect(BigNumber.from(accnt0Balance).lt(
      // default starting value minus bounty (in wei)
      BigNumber.from("9998000000000000000000")
    )).to.equal(true);

    const game = await gameTokens
      .connect(account1)
      .getGame(gameId);

    expect(game.balance).to.equal(ethers.utils.parseEther("2"));
  });

  it("Should allow owner to declare winner", async function () {
    const [account0, account1, account2] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    expect(gameId).to.equal(BigNumber.from(0));

    const winnerTx = await gameTokens
      .connect(account0)
      .setWinner(gameId, account1.address);

    await winnerTx.wait()

    const game = await gameTokens
      .connect(account0)
      .getGame(gameId);

    expect(game.winner).to.equal(account1.address);
  });

  it("Should allow owner to payout winner", async function () {
    const [account0, account1, account2] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    await expect(gameId).to.equal(BigNumber.from(0));

    const bountyTx = await gameTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("10")});

    await bountyTx.wait()

    const winnerTx = await gameTokens
      .connect(account0)
      .setWinner(gameId, account1.address);

    await winnerTx.wait()

    const accnt1Balance = await hre.network.provider.send("eth_getBalance", [
      account1.address,
    ]);

    // Check that the account 0 balance is less then it's initial value minus the bounty
    // note that difference is the gas cost
    await expect(BigNumber.from(accnt1Balance).lt(
      // default starting value minus bounty (in wei)
      BigNumber.from("10010000000000000000000")
    )).to.equal(true);

    const game = await gameTokens
      .connect(account1)
      .getGame(gameId);

    await expect(game.balance).to.equal(ethers.utils.parseEther("0"));
  });

  // Test what it should NOT do
  it("Should be additive when setting a game bounty", async function () {
    const [account0, account1, account2, account3] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    await expect(gameId).to.equal(BigNumber.from(0));

    const bountyTx1 = await gameTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("2")});

    await bountyTx1.wait()

    const bountyTx2 = await gameTokens
      .connect(account3)
      .setBounty(gameId, { value: ethers.utils.parseEther("2")});

    await bountyTx2.wait()

    const game = await gameTokens
      .connect(account1)
      .getGame(gameId);

    await expect(game.balance).to.equal(ethers.utils.parseEther("4"));
  });

  it("Should not allow non-owner to declare winner", async function () {
    const [account0, account1, account2] = accounts;
    const tx = await gameTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    await expect(gameId).to.equal(BigNumber.from(0));

    // Cheater!!!
    await expect(
      gameTokens
      .connect(account1)
      .setWinner(gameId, account1.address)
    ).to.be.revertedWith("sender must be owner");

    const game = await gameTokens
      .connect(account0)
      .getGame(gameId);

    await expect(game.winner).to.equal("0x0000000000000000000000000000000000000000");
  });

});
