# Gila, (desert woodpecker)

This is the backend for Gila a Tableland example app that allows posting messages and following other user's posts.  The main concept demonstrated here is the idea of each user owning there own tweets and followers data, but there is an incentive for a developer/DAO to maintains the application code and enable features like user's finding accounts to follow.  To visualize how this works see below:

![arch diagram](/example-apps/gila/frontend/arch-diagram.png?raw=true "arch diagram")

This is the backend code for the Gila app.  It has been zipped and deployed to AWS Lambda. That cost and the Rinkeby used to pay for gas are provided by the Tableland Network.  In theory this could include a paywall based on a Smart Contract deployed to the EVM network of the owner's choosing.  This type of architecture has a potential two-fold benefit for all involved parties.

1. There is an incentive for someone to develop and maintain the app.  This has a "shallow moat" that could encourage a market for apps that enable viewing a user's Gila data.
2. The user's of the app own their data and they can use a different implementation of the "backend" if they so choose.
