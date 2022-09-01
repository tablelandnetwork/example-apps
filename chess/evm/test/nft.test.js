const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const { BigNumber } = require("ethers");
const { deployAll, appUri, baseUri } = require("./util");

describe("Chess Game NFT Contract", function () {
  let accounts;
  let chessTokens;

  beforeEach(async function () {
    const contracts = await deployAll();

    chessTokens = contracts.chessTokens;
    accounts = await ethers.getSigners();
  });

  const getGame = async function () {
    const [account0, account1, account2] = accounts;

    const tx = await chessTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account2.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    expect(gameId instanceof BigNumber).to.equal(true);

    return gameId;
  };

  // Test what it should do
  it("Should allow minting a games", async function () {
    const [account0, account1, account2] = accounts;

    const gameId = await getGame();

    expect(gameId).to.equal(BigNumber.from(0));

    const gameId2 = await getGame();

    expect(gameId2).to.equal(BigNumber.from(1));
  });

  it("Should allow getting games", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    expect(gameId).to.equal(BigNumber.from(0));

    const game = await chessTokens
      .connect(account1)
      .getGame(gameId);

    // check that players are set
    expect(game.player1).to.equal(account1.address);
    expect(game.player2).to.equal(account2.address);

    // check that defaults are correct
    expect(game.conceded).to.equal(undefined);
    expect(game.winner).to.equal("0x0000000000000000000000000000000000000000");
    expect(game.bounty).to.equal(0);
  });

  it("Should allow getting active games for a player", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    const games = await chessTokens
      .connect(account1)
      .getPlayerGames(account1.address);

    await expect(games.length).to.equal(1);

    const gameId2 = await getGame();

    const games2 = await chessTokens
      .connect(account2)
      .getPlayerGames(account2.address);

    await expect(games2.length).to.equal(2);
    await expect(games2[0]).to.equal(gameId);
    await expect(games2[1]).to.equal(gameId2);
  });

  it("Should return empty list if no active games for a player", async function () {
    const [account0] = accounts;

    const games = await chessTokens
      .connect(account0)
      .getPlayerGames(account0.address);

    await expect(games.length).to.equal(0);
  });

  it("Should deactive game when there is a winner", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    const winnerTx = await chessTokens
      .connect(account0)
      .setWinner(gameId, account1.address);

    await winnerTx.wait()

    const games = await chessTokens
      .connect(account1)
      .getPlayerGames(account1.address);

    await expect(games.length).to.equal(0);
  });

  it("Should allow setting a game bounty", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    expect(gameId).to.equal(BigNumber.from(0));

    const bountyTx = await chessTokens
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

    const game = await chessTokens
      .connect(account1)
      .getGame(gameId);

    expect(game.bounty).to.equal(ethers.utils.parseEther("2"));
  });

  it("Should allow owner to declare winner", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    expect(gameId).to.equal(BigNumber.from(0));

    const winnerTx = await chessTokens
      .connect(account0)
      .setWinner(gameId, account1.address);

    await winnerTx.wait()

    const game = await chessTokens
      .connect(account0)
      .getGame(gameId);

    expect(game.winner).to.equal(account1.address);
  });

  it("Should allow owner to payout winner", async function () {
    const [account0, account1] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    const bountyTx = await chessTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("10")});

    await bountyTx.wait()

    const winnerTx = await chessTokens
      .connect(account0)
      .setWinner(gameId, account1.address);
    await winnerTx.wait()

    const claimTx = await chessTokens
      .connect(account1)
      .claimBounty(gameId);

    await claimTx.wait()

    const accnt1Balance = await hre.network.provider.send("eth_getBalance", [
      account1.address,
    ]);

    // Check that the account 1 balance is it's initial value plus the bounty
    // minus the gas cost of claiming
    expect(BigNumber.from(accnt1Balance).gt(
      // default starting value plus bounty minus gas will be greater than this
      BigNumber.from("10009000000000000000000") // in wei
    )).to.equal(true);

    const game = await chessTokens
      .connect(account1)
      .getGame(gameId);

    await expect(game.bounty).to.equal(ethers.utils.parseEther("0"));
  });

  it("Should allow a player to concede", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    const concedeTx = await chessTokens
      .connect(account1)
      .concede(gameId);

    await concedeTx.wait();

    const game = await chessTokens
      .connect(account1)
      .getGame(gameId);

    await expect(game.winner).to.equal(account2.address);
  })

  it("Should payout winner when player concedes", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    const bountyTx = await chessTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("10")});

    await bountyTx.wait()

    const concedeTx = await chessTokens
      .connect(account1)
      .concede(gameId);

    await concedeTx.wait();

    const claimTx = await chessTokens
      .connect(account2)
      .claimBounty(gameId);

    await claimTx.wait()

    const accnt2Balance = await hre.network.provider.send("eth_getBalance", [
      account2.address,
    ]);

    // Check that the account 2 balance is it's initial value plus the bounty
    // minus the gas cost of claiming
    expect(BigNumber.from(accnt2Balance).gt(
      // default starting value plus bounty minus gas will be greater than this
      BigNumber.from("10009000000000000000000") // in wei
    )).to.equal(true);
  });

  it("Should be additive when setting a game bounty", async function () {
    const [account0, account1, account2, account3] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    const bountyTx1 = await chessTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("2")});

    await bountyTx1.wait()

    const bountyTx2 = await chessTokens
      .connect(account3)
      .setBounty(gameId, { value: ethers.utils.parseEther("2")});

    await bountyTx2.wait()

    const game = await chessTokens
      .connect(account1)
      .getGame(gameId);

    await expect(game.bounty).to.equal(ethers.utils.parseEther("4"));
  });

  it("Should allow address that deployed to set base URI", async function () {
    const [account0] = accounts;

    const gameId = await getGame();

    const originalUri = await chessTokens
      .connect(account0)
      .tokenURI(gameId);

    expect(originalUri.indexOf(baseUri)).to.equal(0)

    const newUri = "http://newdomain.com/query?s=";
    await chessTokens
      .connect(account0)
      .setBaseURI(newUri);

    const newBaseUri = await chessTokens
      .connect(account0)
      .tokenURI(gameId);

    expect(originalUri).not.to.equal(newBaseUri);
    expect(newBaseUri.indexOf(baseUri)).to.equal(-1);
    expect(newBaseUri.indexOf(newUri)).to.equal(0);
  });

  it("Should allow address that deployed to set app URI", async function () {
    const [account0] = accounts;

    const gameId = await getGame();

    const originalUri = await chessTokens
      .connect(account0)
      .tokenURI(gameId);

    expect(originalUri.indexOf(appUri)).to.equal(223);

    const newUri = "http://newdomain.ipfs";
    await chessTokens
      .connect(account0)
      .setAppBaseURI(newUri);

    const newAppUri = await chessTokens
      .connect(account0)
      .tokenURI(gameId);

    expect(originalUri).not.to.equal(newAppUri);
    expect(newAppUri.indexOf(appUri)).to.equal(-1);
    expect(newAppUri.indexOf(newUri)).to.equal(223);
  });

  // Test what it should NOT do
  it("Should not allow non-owner to declare winner", async function () {
    const [account0, account1, account2] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    // Cheater!!!
    await expect(
      chessTokens
      .connect(account1)
      .setWinner(gameId, account1.address)
    ).to.be.revertedWith("sender must be owner");

    const game = await chessTokens
      .connect(account0)
      .getGame(gameId);

    await expect(game.winner).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should not allow the same address to play itself", async function () {
    const [account0, account1, account2] = accounts;

    await expect(
      chessTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account1.address)
    ).to.be.revertedWith("players cannot share an address");
  });

  it("Should not allow non-player to concede", async function () {
    const [account0, account1, account2, account3] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    // Cheater!!!
    await expect(
      chessTokens
      .connect(account3)
      .concede(gameId)
    ).to.be.revertedWith("sender must be a player");
  });

  it("Should not allow a bounty if the owner is a player", async function () {
    const [account0, account1, account2] = accounts;

    const tx = await chessTokens
      .connect(account0)
      .mintGame(account0.address, account1.address, account0.address);

    const receipt = await tx.wait();
    const [transferEvent] = receipt.events ?? [];
    const gameId = transferEvent.args.tokenId;

    await expect(gameId).to.equal(BigNumber.from(0));

    // No bounty allowed if owner is a player since the
    // owner can mark themself the winner at any time
    await expect(
      chessTokens
      .connect(account2)
      .setBounty(gameId, { value: ethers.utils.parseEther("10")})
    ).to.be.revertedWith("owner is a player");
  });

  it("Should not allow a bounty if the game does not exist", async function () {
    const [account0] = accounts;

    // No bounty allowed if hasn't been minted
    await expect(
      chessTokens
      .connect(account0)
      .setBounty(BigNumber.from(1), { value: ethers.utils.parseEther("10")})
    ).to.be.revertedWith("game does not exist");
  });

  it("Should not allow adding bounty if the game is over", async function () {
    const [account0, account1] = accounts;
    const gameId = await getGame();

    await expect(gameId).to.equal(BigNumber.from(0));

    const concedeTx = await chessTokens
      .connect(account1)
      .concede(gameId);

    await concedeTx.wait();

    // No bounty allowed if hasn't been minted
    await expect(
      chessTokens
      .connect(account0)
      .setBounty(gameId, { value: ethers.utils.parseEther("10")})
    ).to.be.revertedWith("game has ended");
  });

  it("Should not allow concede if the game does not exist", async function () {
    const [account0] = accounts;

    // No bounty allowed if hasn't been minted
    await expect(
      chessTokens
      .connect(account0)
      .concede(BigNumber.from(1))
    ).to.be.revertedWith("game does not exist");
  });

  it("Should not allow setWinner if the game does not exist", async function () {
    const [account0, account1] = accounts;

    // No bounty allowed if hasn't been minted
    await expect(
      chessTokens
      .connect(account0)
      .setWinner(BigNumber.from(1), account1.address)
    ).to.be.revertedWith("game does not exist");
  });

  it("Should not return if the game does not exist", async function () {
    const [account0] = accounts;

    // No bounty allowed if hasn't been minted
    await expect(
      chessTokens
      .connect(account0)
      .getGame(BigNumber.from(1))
    ).to.be.revertedWith("game does not exist");
  });

  it("Should only allow deployer address to set app URI", async function () {
    const [account0, account1] = accounts;

    const newBaseUri = "http://newdomain.ipfs";
    // account1 did not deploy the contract
    await expect(
      chessTokens
      .connect(account1)
      .setAppBaseURI(newBaseUri)
    ).to.be.revertedWith("only the address that deployed the contract can call");
  });

  it("Should only allow deployer address to set base URI", async function () {
    const [account0, account1] = accounts;

    const newBaseUri = "http://newdomain.com";
    // account1 did not deploy the contract
    await expect(
      chessTokens
      .connect(account1)
      .setBaseURI(newBaseUri)
    ).to.be.revertedWith("only the address that deployed the contract can call");
  });

});
