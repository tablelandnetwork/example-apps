const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chess", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Chess = await ethers.getContractFactory("Chess");
    const chess = await Chess.deploy();
    await chess.deployed();

    const address19 = "8626f6940e2eb28930efb4cef49b2d1f2c9c1199"
    const policy = await chess.getPolicy(`0x${address19}`);

    console.log(policy.toString());
    expect(policy.toString()).to.equal(`true,false,false,player_address = ${address19}`);

  });
});
