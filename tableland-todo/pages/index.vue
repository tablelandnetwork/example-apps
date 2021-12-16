<template>
  <MjContainer>
    <div class="ml-4 mt-8 flex justify-between">
      <div>
        <img src="@/static/logo.svg" class="w-20 inline" alt="TODO: get a tableland logo">
        <div class="relative inline h-20 w-20 mr-10">
          <div class="absolute -bottom-10 -left-5 font-bold">
            ableland
          </div>
        </div>
        <span class="mr-8"></span>
        <img src="@/static/logo.svg" class="w-20 inline" alt="TODO: get a tableland logo">
        <div class="relative inline h-20 w-20 mr-10">
          <div class="absolute -bottom-10 -left-5 font-bold">
            odos
          </div>
        </div>
      </div>

      <div class="mt-4 mr-4">
        <MjRow>
          <MjButton
            variant="secondary"
            :loading="loading"
            :disabled="tablelandConnected"
            @click="connect"
            class="float-right"
          >
            <span v-if="!tablelandConnected">
              Connect
            </span>

            <span v-if="tablelandConnected">
              Disconnect
            </span>
          </MjButton>
        </MjRow>
        <div class="mt-2 w-60 h-8 truncate text-gray-500">
          <span v-if="ethAddress">
            ETH Addr: {{ ethAddress }}
          </span>
        </div>
      </div>
    </div>
    <MjDivider class="my-8"></MjDivider>

    <MjContainer v-if="!tablelandConnected">
      <MjHeadline :size="2" class="font-bold mt-16 m-8">Howdy, Yonder Lies Tableland</MjHeadline>
      <MjHeadline :size="4" class="text-center">
        To get started you'll need to connect to Tableland so we know who you are.  This will connect you to Metamask, if you're not already, then we will find any tables you might have already created and let you create new ones too!
      </MjHeadline>
      <MjRow class="justify-center">
        <MjButton
          variant="secondary"
          :loading="loading"
          :disabled="tablelandConnected"
          @click="connect"
        >
          Connect to Tableland <img src="@/static/logo.svg" class="w-8 inline" alt="TODO: get a tableland logo">
        </MjButton>
      </MjRow>
    </MjContainer>

    <MjRow v-if="tablelandConnected">
      <MjRowItem class="w-1/3 p-2">
        <div class="p-4 shadow rounded">
          <TableViewer></TableViewer>
        </div>
      </MjRowItem>

      <MjRowItem class="w-2/3 p-2">
        <div class="p-4 shadow rounded">
          <Todos></Todos>
        </div>
      </MjRowItem>
    </MjRow>

    <MjToast
      ref="toast"
      align="left"
      position="top"
    ></MjToast>
  </MjContainer>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';


/*
table.js Call connect after user clicks button, lib will handle not connecting if already connected
2. Is the user's wallet connected? 
    1. NO: Ask them to connect their wallet with Metamask.
    2. YES: Go to next step.

TODO: lib tracks token and app doesn't know about it
3. Does a session token exist in browser storage?
    1. NO: Create a local self-signed session token (JWT). This step requires the user to sign using Metamask.
    2. YES: Go to next step.

App does runSql('WHERE ...') to get all tables for this eth account
if none prompt to make first one, if some let them choose and also allow making new ones
4. Does the user already control some tables? Answer this question by querying the validator for all the tables controlled by their address. There is no need to read from the table registry contract. 
    1. NO: Present the user with a "setup your to-dos" button. Clicking the button should open Metamask and ask the user to confirm if they really want to mint a table from the registry.
    2. YES: If there *are* tables controlled by the address, show them to the user and let them select the correct one. Also show them the same "setup your to-dos" button as in step (a) above in case they don't want to use an existing table. We can worry about schema mismatches later by doing some schema validation and/or allowing the application to filter tables by table schema. Don't worry about this for now.

Save in Vuex store, NOT native browser localStorage
5. Save the table ID in browser storage. It will be needed to create/update/delete to-dos.

use runSql to get the tasks, then populate store with them
6. At this point, the user has a session token for interacting with the validator and has minted a table and we know its ID. The app uses the token to fetch their table rows from the validator using a query. The validator returns the results of the query, which are rendered as to-dos on the page.

For 7, 8, and 9 use runSql to do the things
7. The user can now create a to-do. There is no need to interact with the table registry from the app.
8. The user can update a to-do.
9. The user can delete a to-do.

call disconnect method in table.js, TODO: I think this method needs to be built still
10. The user can click a *logout* button which results in the session token being destroyed and their wallet being disconnect.
*/


export default Vue.extend({
  data: function () {
    return {
      tableInit: false as boolean,
      metaMaskConnected: false as boolean,
      tablelandConnected: false as boolean,
      loading: false as boolean,
      ethAddress: null as any
    };
  },
  computed: {
    ...mapState({
      tables: (state: any) => state.allTables
    })
  },
  methods: {
    createTable: async function (name: string) {
      if (this.loading) return;

      this.loading = true;

      try {
        await this.$store.dispatch('createTable', {name: name});
      } catch (err) {
        console.log(err);
        (this.$refs.toast as any).log(err);
      }

    },
    connect: async function () {
      if (this.loading) return;

      this.loading = true;

      if (typeof window.ethereum === 'undefined') {
        (this.$refs.toast as any).log('You will need MetaMask Installed to use Tableland Todos')
        return;
      }

      try {
        await this.$store.dispatch('connect');

        this.tablelandConnected = true;
        (this.$refs.toast as any).log('Connected to Tableland!');
      } catch (err) {
        console.log(err);
        (this.$refs.toast as any).log('Darn! Having trouble connecting to Tableland.  Please make sure you have the MetaMask extension installed in your browser');
      }

      this.loading = false;
    }
  }
});

</script>
