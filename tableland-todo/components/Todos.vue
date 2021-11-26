<!-- Please remove this file from your project -->
<template>
  <div class="bg-gray-900 relative flex items-top justify-center min-h-screen bg-gray-100 sm:items-center sm:pt-0">
    <MjButton @click="createTask">
      Create Task
    </MjButton>
    
    <MjContainer class="col-span-2 lg:col-span-1 p-4 shadow bg-gray-900">
      <div v-for="task in tasks" :key="task.id" class="flex">
        <MjCheckbox
          v-model="task.complete"
          name="checkbox"
          class="flex self-center mr-4"
        >
        </MjCheckbox>
        <MjInput v-model="task.name" placeholder="Choose a name...">
          <template #icon #suffix>
            <MjIcon name="edit-2"></MjIcon>
          </template>
        </MjInput>
      </div>
    </MjContainer>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';

interface Task {
  complete: boolean;
  name: string;
  id: number;
};

export default Vue.extend({
  data: function () {
    return {
      tasks: [] as Task[]
    };
  },
  methods: {
    createTask: function () {
      this.tasks.push({complete: false, name: '', id: this.getNextId()});
    },
    getNextId: function () {
      const taskIds = this.tasks.map(task => task.id).sort((a, b) => a > b ? 1 : -1);
      const lastId = taskIds[taskIds.length - 1];

      return (lastId || 0) + 1;
    }
  }
});

</script>
