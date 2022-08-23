import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("CanvasGame", function () {
  let accounts: SignerWithAddress[];
  let registry: any;
  let canvasGame: any;

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("TablelandTables");
    registry = await RegistryFactory.deploy();
    await registry.deployed();
    await registry.connect(accounts[0]).initialize("http://localhost:8080/");

    const CanvasGame = await ethers.getContractFactory("CanvasGame");
    canvasGame = await upgrades.deployProxy(CanvasGame, [
      "https://testnet.tableland.network/query?s=",
      "not.implemented.com"
    ], {
      kind: "uups",
    });

    await canvasGame.deployed();

    await canvasGame.connect(accounts[0]).createMetadataTable(registry.address);
  });

  it("Should allow minting", async function () {
    const tx = await canvasGame
      .connect(accounts[0])
      .safeMint(accounts[0].address);

    const receipt = await tx.wait();
    const [, transferEvent] = receipt.events ?? [];
    const tokenId1 = transferEvent.args!.tokenId;

    const tx2 = await canvasGame
      .connect(accounts[1])
      .safeMint(accounts[1].address);

    const receipt2 = await tx2.wait();
    const [, transferEvent2] = receipt2.events ?? [];
    const tokenId2 = transferEvent2.args!.tokenId;

    await expect(tokenId1).to.equal(0);
    await expect(tokenId2).to.equal(1);
  });

  it("Should make contract owner of the table", async function () {
    const owner = await registry.connect(accounts[0]).ownerOf(1);

    await expect(owner).to.equal(canvasGame.address);
  });

  it("Should allow making a move", async function () {
    // mint the token
    const tx = await canvasGame
      .connect(accounts[1])
      .safeMint(accounts[1].address);

    const receipt = await tx.wait();
    const [, transferEvent] = receipt.events ?? [];
    const tokenId = transferEvent.args!.tokenId;

    const statement =
      "UPDATE canvas_31337_1 SET x = 10, y = 10 WHERE id = 0;";

    // TODO: this fails with `expected [] to equal []` because Array literals aren't equal
    //       I can't find a way to change the comparison logic for emit tests.
    // UPDATE: once this issue https://github.com/TrueFiEng/Waffle/issues/245
    //         is fixed this test should pass
    await expect(canvasGame.connect(accounts[1]).makeMove(tokenId, 10, 10))
      .to.emit(registry, "RunSQL")
      .withArgs(canvasGame.address, true, 1, statement, [
        true,
        true,
        true,
        "",
        "",
        [],
        [],
      ]);
  });
});
