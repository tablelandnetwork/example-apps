<template>
  <MjTable>
    <MjTableHead>
      <MjTableHeader class="bg-white dark:bg-gray-900">
        Name
      </MjTableHeader>

      <MjTableHeader class="bg-white dark:bg-gray-900">
        Complete
      </MjTableHeader>

      <MjTableHeader class="bg-white dark:bg-gray-900">
        ID
      </MjTableHeader>
    </MjTableHead>

    <MjTableBody>
      <MjTableRow v-for="task in tasks" :key="task.id">
        <MjTableCell>
          {{ task.name }}
        </MjTableCell>

        <MjTableCell>
          {{ task.complete }}
        </MjTableCell>

        <MjTableCell>
          {{ task.id }}
        </MjTableCell>
      </MjTableRow>
    </MjTableBody>
  </MjTable>
</template>

<script>

import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  computed: {
    ...mapState({
      tasks: state => state.tablelandTasks
    })
  }
});

</script>
