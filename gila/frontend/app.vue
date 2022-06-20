<template>
  <div class="container mx-auto">
    <Notes />

    <div class="w-full mt-16 text-center" v-if="!$store.connected && !$store.noAccount && !connecting">
      <p class="px-16 mb-2 font-bold">Hi I'm Gila! Just a little bird living my best life in the Tableland desert.</p>
      <img src="~/assets/images/gila.jpg" class="h-32 mx-auto mb-8">
      <p class="px-16 mb-8">Click the connect button below to create your account and start tweeting and following.  You'll be asked to sign a message to authenticate, and if this is your first time here, you'll need to pay some gas to create the tables that you'll use to tweet and follow.  You'll also need to be added to the Gila Users table, but Tableland is graciously paying the gas for this!</p>
      <Button label="connect" class="p-button-rounded" :disabled="connecting" @click="connect" />
    </div>

    <div v-if="connecting" class="w-full h-96 mt-16 text-center">
      <ProgressSpinner />
    </div>

    <Cactus v-if="$store.connected" />
  </div>
</template>

<script lang="ts">

import { mapStores } from 'pinia';
import { store } from './store/index';

export default {
  data: function () {
    return {
      connecting: false
    };
  },
  computed: {
    ...mapStores(store)
  },
  methods: {
    connect: async function () {
      try {
        this.connecting = true;

        await this.$store.connect();

        this.connecting = false;
      } catch (err) {
        this.$store.alert('Failed to connect: ' + err.message);
        this.connecting = false;
      }
    }
  }
};

</script>
