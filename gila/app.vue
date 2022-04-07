<template>
  <div>
    <Cactus v-if="connected" />
  </div>
</template>

<script lang="ts">

export default {
  data() {
    return {
      connected: true
    };
  },
  methods: {
    connect: function () {

    },
    createAccount: function () {
      
    }
  }
};

</script>
