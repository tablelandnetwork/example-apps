<template>
  
</template>

<script>

import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  computed: {
    ...mapState({
      tasks: state => state.tasks
    })
  }
});

</script>
