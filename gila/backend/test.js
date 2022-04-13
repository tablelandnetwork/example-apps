const config = require('dotenv').config();
const { Wallet } = require('ethers');
const service = require('./index');


const test = async function () {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new Wallet(privateKey);

    const message = 'test message';
    const signed = await wallet.signMessage(message);

    const res = await service.handler({body: JSON.stringify({
        message: message,
        signature: signed,
        address: process.env.ACCOUNT,
        tweets: 'test_tweets_12',
        follow: 'test_follow_12'
    })});

    console.log(res);
};

test();
