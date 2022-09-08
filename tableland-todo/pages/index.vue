<template>
  <MjContainer>
    <div class="ml-4 mt-8 flex justify-between">
      <div>
        <div class="items-center mr-10 mt-4 font-bold text-orbitron text-3xl">
          Tableland Todos
        </div>
      </div>

      <div class="mt-4 mr-4">
        <MjRow>
          <MjButton
            variant="secondary"
            :loading="loading"
            :disabled="tablelandConnected || !onRinkeby"
            @click="connect"
            class="float-right text-poppins"
          >
            <span v-if="!tablelandConnected">
              Connect to Tableland
            </span>

            <span v-if="tablelandConnected">
              Disconnect
            </span>
          </MjButton>
        </MjRow>
      </div>
    </div>
    <MjDivider class="my-8"></MjDivider>

    <MjContainer v-if="!tablelandConnected">
      <MjNote v-if="!onRinkeby" variant="danger" class="mb-4">
        You're not connected to Rinkeby Testnet where the Tableland Smart Contract is Deployed. To use this app change your wallet's network to Rinkeby and refresh the page this before proceeding.
      </MjNote>

      <MjRow class="justify-center">
        <MjButton
          variant="secondary"
          :loading="loading"
          :disabled="tablelandConnected || !onRinkeby"
          @click="connect"
          class="text-poppins"
        >
          Connect to Tableland
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
    1. NO: Create a local self-signed session token (signed and encoded SIWE message).
           This step requires the user to sign using Metamask.
    2. YES: Go to next step.

App does runSql('... WHERE ...') to get all tables for this eth account
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
      ethAddress: null as any,
      onRinkeby: true as boolean
    };
  },
  computed: {
    ...mapState({
      tables: (state: any) => state.allTables,
      toastMessage: (state: any) => state.alertMessage
    })
  },
  watch: {
    toastMessage: function (message) {
      console.log(message);
      if (message) this.showToast(message);
    }
  },
  methods: {
    connect: async function () {
      if (this.loading) return;
      if (!this.checkNetwork()) return;

      this.loading = true;

      try {
        await this.$store.dispatch('connect');

        this.tablelandConnected = true;
        await this.$store.dispatch('alert', {
          message: 'Connected to Tableland!'
        });
      } catch (err) {
        console.log(err);
        await this.$store.dispatch('alert', {
          message: 'Darn! Having trouble connecting to Tableland.  Please make sure you have the MetaMask extension installed in your browser'
        });
      }

      this.loading = false;
    },
    // One messaging toaster at the page level to ensure layout doesn't affect visibility
    showToast: function (message: string) {
      (this.$refs.toast as any).log(message);
    },
    checkNetwork: function () {
      const chainId = (window as any).ethereum?.chainId;

      this.onRinkeby = chainId === '0x4';

      return this.onRinkeby;
    }
  },
  mounted: function () {
    // use dark theme
    document.getElementsByTagName('html')[0].setAttribute('class', 'dark dark-mode');
    // ensure computed is recalculated after ethereum object has had a chance to be injected
    setTimeout(() => {
      this.checkNetwork();
    }, 500);
  }
});

</script>
