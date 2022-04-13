<template>
  <transition-group name="p-message" tag="div">
    <Message v-for="msg of $store.messages" :severity="msg.severity" :key="msg.id">{{msg.content}}</Message>
  </transition-group>
</template>

<script>

import { mapStores } from 'pinia';
import { store } from '../store/index';

export default {
  computed: {
    ...mapStores(store)
  }
}
</script>
