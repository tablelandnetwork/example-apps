import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";


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
    canvasGame = await CanvasGame.deploy(registry.address);
    await canvasGame.deployed();
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
});
