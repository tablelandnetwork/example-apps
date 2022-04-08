<template>
  <div>
    <div v-if="!$store.connected">
      <Button label="Connect" class="p-button-rounded" :disabled="connecting" @click="connect" />
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
      this.connecting = true;
      await this.$store.connect();
      this.connecting = false;
    }
  }
};

</script>
