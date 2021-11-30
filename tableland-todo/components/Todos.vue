<!-- Please remove this file from your project -->
<template>
  <div class="flex items-top justify-center min-h-screen items-center sm:pt-0">
    <MjContainer class="text-center">
      <div class="my-4 mx-auto w-64">
        <div class="text-left" @click.prevent="toggleAll">
          <MjCheckbox
            v-if="tasks.length > 1"
            v-model="allChecked"
            :mixed="mixedChecked"
          >
            All
          </MjCheckbox>
        </div>
      </div>
      <div v-for="task in tasks" :key="task.id" class="m-auto w-64">
        <div class="flex">
          <MjCheckbox
            v-model="task.complete"
            class="flex self-center mr-4"
          >
          </MjCheckbox>
          <MjInput v-model="task.name" placeholder="Choose a name...">
            <template #icon #suffix>
              <MjIcon name="edit-2"></MjIcon>
            </template>
          </MjInput>

          <div class="flex self-center ml-4 cursor-pointer" name="delete" @click="deleteTask(task)">
            <MjIcon name="delete"></MjIcon>
          </div>
        </div>
      </div>

      <div class="m-auto w-64 text-left">
        <MjButton class="mt-2 ml-8" @click="createTask" variant="secondary">
          <MjIcon name="plus"></MjIcon>
          New Task
        </MjButton>
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
  computed: {
    allChecked: function (): boolean {
      return this.tasks.length === this.tasks.filter((task: Task) => task.complete).length;
    },
    mixedChecked: function (): boolean {
      const completedCount = this.tasks.filter((task: Task) => task.complete).length
      return !!completedCount && this.tasks.length !== completedCount;
    }
  },
  methods: {
    createTask: function () {
      this.tasks.push({complete: false, name: '', id: this.getNextId()});
    },
    deleteTask: function (task: Task) {
      this.tasks = this.tasks.filter((t: Task) => t.id !== task.id);
    },
    toggleAll: function () {
      console.log('toggle');
      const allChecked = this.allChecked;
      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i];
        task.complete = !allChecked;
      }
    },
    getNextId: function () {
      const taskIds = this.tasks.map(task => task.id).sort((a, b) => a > b ? 1 : -1);
      const lastId = taskIds[taskIds.length - 1];

      return (lastId || 0) + 1;
    }
  }
});

</script>
