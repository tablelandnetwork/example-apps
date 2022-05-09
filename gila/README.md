# Gila, (desert woodpecker)

<img src="https://github.com/tablelandnetwork/example-apps/blob/main/gila/frontend/assets/images/gila.jpg?raw=true" alt="I'm Gila!" title="I'm Gila!" width="200">

Gila is a Tableland proof of concept (POC) that is effectively a very simplified twitter clone.  The goal of this POC is to demonstrate one idea for how Tableland can support users owning their own tweets and followers data, but a developer/DAO has incentive to maintain the application code and enable features like user's finding accounts to follow.  To visualize how this works see below:

In this architecture there are 2 types of actors, Users and Developers.  Users are individuals who want to create **tweets** that are visible to other Users.  Developers are one or more individuals, or maybe a DAO, who have created a Tableland app that enables Users to find Users to follow, and see other User's tweets in a convenient way.  In the case of this example the app has a frontend built using [Nuxt3](https://v3.nuxtjs.org/) and the backend is a small AWS Lambda function.

The usage flow of Gila is as follows:
A user navigates to the the frontend which is hosted via Textile.io and IPFS.  Once the page has loaded the user is given a very brief explanation of what the app does, and is asked to connect to tableland with their browser's wallet.
Upon connecting the user will sign a message to ensure that they are on the beta-users passlist, then they will pay to "mint" two tables. One that holds their tweets, and one that holds data on who they would like to see tweets from.
The Developer who has designed and created the code in this repository has created a table that they own, `all_users`, which has a list of all the users who have indicated that they are using Gila.  Users who want to make finding their accounts easier can do so by making a request to the developer to add them to the `all_users` table.  These inserts are enabled via an AWS Lambda function that is paid for by the Developer.  In this example Tableland is paying to host this app, but in theory the Developer would have some kind of paywall or message indicating how Users who find this useful can help pay for it.  The Developer would also in theory pay to pin the client to IPFS.


Here's a visualization of this architecture:

![arch diagram](https://github.com/tablelandnetwork/example-apps/blob/main/gila/frontend/arch-diagram.png?raw=true "arch diagram")

### Incentivization within this arcitecture

One of the obvious diffences between this and Web2 social media is that the User will have to Pay to use this. This "pay to use" business model is enabled by Tableland because the User is given ownership of their data, and the Developer has a mechanism to be compensated for the work and operating costs required to enable a social media platform.

As a User, when you use Gila you are prompted for 2 different types of payments:
1. Paying to "mint" tables within the Tableland network.  This payment results in the User having ownership of the tables that they have created.
2. Paying the Developer for their work in building, maintaining, and hosting the application code and the application tables.  This payment goes to someone else, the Developer, and is a payment for a service that has been and/or will be provided.

This 2 fold payment ensures that there is a "mote" that incentivizes the Developer to build the application, but the mote remains "shallow" because the user has actual ownership over their data.
It's worth pointing out that while this model enables a strictly pay to use pattern, it also leaves open the possibility of an advertizement model as well.


### Notes:

 - There is a working version of this POC hosted [here](https://bafzbeidty3rf4d2ofrbugrfzqzejpyi2zm664zhbohk2qwblsm645qat7e.textile.space/)
 - When this POC was created Nuxt3 was not yet a release canidate, so the client code might be fragile.
