const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chess", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Chess = await ethers.getContractFactory("Chess");
    const chess = await Chess.deploy("Hello, world!");
    await chess.deployed();

    expect(await chess.greet()).to.equal("Hello, world!");

    const setGreetingTx = await chess.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await chess.greet()).to.equal("Hola, mundo!");
  });
});
