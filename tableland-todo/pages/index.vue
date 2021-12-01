<template>
  <MjContainer>
    <div class="ml-4 mt-8">
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
      <div class="float-right mt-4 mr-4">
        <MjButton variant="secondary" :loading="loading" :disabled="metaMaskConnected" @click="connectMetaMask">
          <span v-if="!metaMaskConnected">
            Connect MetaMask <img src="@/static/metamask-fox.svg" alt="MetaMask Fox" class="inline">
          </span>

          <span v-if="metaMaskConnected">
            <img src="@/static/metamask-fox.svg" alt="MetaMask Fox" class="inline"> MetaMask Connected
          </span>
        </MjButton>
      </div>
    </div>
    <MjDivider class="my-8"></MjDivider>

    <div v-if="!tableInit">
      <MjHeadline :size="2" class="font-bold mt-16 m-8">Howdy, Yonder Lies Tableland</MjHeadline>
      <MjHeadline :size="4" class="text-center">
        To get started you'll need to build your first table. As a proof of concept we are going to make a to-do list tracker
      </MjHeadline>
      <div class="mx-auto mt-4 w-48">
        <MjButton size="lg" :loading="loading" @click="buildTable">
          Get Started
        </MjButton>
      </div>
    </div>

    <MjRow v-if="tableInit">
      <MjRowItem class="w-2/3">
        <div class="p-4 shadow rounded-l">
          <Todos></Todos>
        </div>
      </MjRowItem>

      <MjRowItem class="w-1/3">
        <div class="p-4 shadow rounded-r">
          <TableViewer></TableViewer>
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

export default Vue.extend({
  data: function () {
    return {
      tableInit: false as boolean,
      metaMaskConnected: false as boolean,
      loading: false as boolean
    };
  },
  computed: {
    ...mapGetters({
      provider: 'getProvider',
      signer: 'getSigner'
    })
  },
  methods: {
    buildTable: function () {
      if (this.loading) return;

      if (!this.$store.getters.getProvider()) {
        (this.$refs.toast as any).log('You will need to connect to MetaMask before you can create your Table')
        return;
      }

      this.loading = true;
      setTimeout(() => {
        this.tableInit = true;
        this.loading = false;
      }, 1500);
    },
    connectMetaMask: async function () {
      if (this.loading) return;

      this.loading = true;

      if (typeof window.ethereum === 'undefined') {
        (this.$refs.toast as any).log('You will need MetaMask Installed to create your Table')
        return;
      }

      try {
        await this.$store.dispatch('connectMetaMask', {ethereum: window.ethereum});

        const blockNumber = await this.$store.getters.getProvider().getBlockNumber();

        this.metaMaskConnected = true;
        (this.$refs.toast as any).log('Connected to MetaMask! If you\'re curious we\'re at Block Number: ' + blockNumber);
      } catch (err) {
        console.log(err);
        (this.$refs.toast as any).log('Darn! Having trouble connecting to MetaMask.  You\'ll need to connect before we can build your Todos Table');
      }

      this.loading = false;
    }
  }
});

</script>
