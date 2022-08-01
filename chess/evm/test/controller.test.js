const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const validatorService = "http://localhost:8080";
describe("Chess", function () {
  let accounts;
  let registry;
  let chessTokens;
  let chessPolicy;
  let movesTableId;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("TablelandTables");
    registry = await RegistryFactory.deploy();
    await registry.deployed();
    await registry.initialize(validatorService);

    const ChessTokenFactory = await ethers.getContractFactory("ChessToken");
    chessTokens = await ChessTokenFactory.deploy(validatorService, registry.address);
    await chessTokens.deployed();
    await chessTokens.initCreateMetadata();
    await chessTokens.initCreateMoves();

    const ChessPolicyFactory = await ethers.getContractFactory("ChessPolicy");
    chessPolicy = await ChessPolicyFactory.deploy(chessTokens.address);
    await chessPolicy.deployed();

    await chessTokens.initSetController(chessPolicy.address);

    movesTableId = await chessTokens.getMovesTableId();
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

  it("Should return a policy for the caller", async function () {
    const account = accounts[1];
    const gameId1 = await getGame();
    const gameId2 = await getGame();

    const runTx = await registry.connect(account).runSQL(account.address, movesTableId, 'write query');
    // TODO: look in event to see if policy is correct?
    const runReceipt = await runTx.wait();
    let [runEvent] = runReceipt.events ?? [];

    const policy = runEvent.args.policy;

    expect(policy[0]).to.equal(true);
    expect(policy[1]).to.equal(false);
    expect(policy[2]).to.equal(false);
    expect(policy[3]).to.equal(
      `player_address = ${account.address.toLowerCase()} AND game_id IN ('${gameId1}', '${gameId2}')`
    );
    expect(policy[4]).to.equal("");
    expect(Array.isArray(policy[5])).to.equal(true);
    expect(policy[5].length).to.equal(0);
  });

  it("Should change policy based on caller active games", async function () {
    const [account0, account1] = accounts;
    const gameId1 = await getGame();
    const gameId2 = await getGame();

    const runTx1 = await registry.connect(account1).runSQL(account1.address, movesTableId, 'write query');
    const runReceipt1 = await runTx1.wait();
    const [runEvent1] = runReceipt1.events ?? [];

    const policy1 = runEvent1.args.policy;

    expect(policy1[0]).to.equal(true);
    expect(policy1[1]).to.equal(false);
    expect(policy1[2]).to.equal(false);
    expect(policy1[3]).to.equal(
      `player_address = ${account1.address.toLowerCase()} AND game_id IN ('${gameId1}', '${gameId2}')`
    );
    expect(policy1[4]).to.equal("");
    expect(Array.isArray(policy1[5])).to.equal(true);
    expect(policy1[5].length).to.equal(0);

    const winnerTx = await chessTokens
      .connect(account0)
      .setWinner(gameId1, account1.address);

    await winnerTx.wait()

    const runTx2 = await registry.connect(account1).runSQL(account1.address, movesTableId, 'write query');
    const runReceipt2 = await runTx2.wait();
    const [runEvent2] = runReceipt2.events ?? [];

    const policy2 = runEvent2.args.policy;

    expect(policy2[0]).to.equal(true);
    expect(policy2[1]).to.equal(false);
    expect(policy2[2]).to.equal(false);
    expect(policy2[3]).to.equal(
      `player_address = ${account1.address.toLowerCase()} AND game_id IN ('${gameId2}')`
    );
    expect(policy2[4]).to.equal("");
    expect(Array.isArray(policy2[5])).to.equal(true);
    expect(policy2[5].length).to.equal(0);
  });

});
