const url = require('url');
const host = 'http://localhost:3000'

exports.handler = async function (event) {
    if (!event.rawQueryString) return {
        status: 404
    }

    const params = new URLSearchParams(event.rawQueryString);

    const game = params.get('game');
    const player1 = params.get('white');
    const player2 = params.get('black');

    if (!game) {
        console.log('query missing game')
        throw new Error('query missing game');
    }
    if (!player1) {
        console.log('query missing player1')
        throw new Error('query missing player1');
    }
    if (!player2) {
        console.log('query missing player2')
        throw new Error('query missing player2');
    }

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: game,
            external_url: `${host}?game=${game}&black=${player2}&white=${player1}`,
            animation_url: `${host}?game=${game}&black=${player2}&white=${player1}&animate=true`,
            image: `${host}/public/favicon.ico`,
            attributes: [
                {
                    trait_type: 'player1',
                    value: player1
                },
                {
                    trait_type: 'player2',
                    value: player2
                }
            ]
        }),
    };
    return response;
};
