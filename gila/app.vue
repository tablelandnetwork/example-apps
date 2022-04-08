<template>
  <div>
    <Button v-if="!$store.connected" label="Connect" class="p-button-rounded" :disabled="connecting" @click="connect" />
    <Cactus v-if="$store.connected" />
  </div>
</template>

<script lang="ts">

import { mapStores } from 'pinia';
import { store } from './store/index';

export default {
  /*data: function () {
    return {
      connected: true
    };
  },*/
  computed: {
    ...mapStores(store)
  },
  methods: {
    connect: async function () {
      this.$store.connect();
    }
  }
};

</script>
