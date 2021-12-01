<template>
  <div class="flex items-top items-center sm:pt-0">
    <MjContainer class="text-center">
      <div class="my-4 mx-auto w-64 h-6">
        <div class="text-left">
          <MjTransitionFadeY
            flip
          >
            <MjCheckbox
              v-if="tasks.length > 1"
              :options="allChecked"
              @change="toggleAll"
            >
              All
            </MjCheckbox>
          </MjTransitionFadeY>
        </div>
      </div>
      <MjTransitionFadeY
        flip
        group
        tag="div"
      >
        <div v-for="task in tasks" :key="task.id" class="m-auto w-64">
          <div class="flex">
            <MjCheckbox
              :options="task.complete"
              @change="val => updateTask({complete: val}, task)"
              class="flex self-center mr-4"
            >
            </MjCheckbox>
            <MjInput
              :value="task.name"
              @input="val => updateTask({name: val}, task)"
              placeholder="Choose a name..."
              :ref="'task-' + task.id"
            >
              <template #icon #suffix>
                <MjIcon name="edit-2"></MjIcon>
              </template>
            </MjInput>

            <div class="flex self-center ml-4 cursor-pointer" name="delete" @click="deleteTask(task)">
              <MjIcon name="delete"></MjIcon>
            </div>
          </div>
        </div>
      </MjTransitionFadeY>

      <div class="m-auto w-64 text-left">
        <MjButton class="mt-2 ml-8" :loading="loading" :disabled="loading" @click="createTask" variant="secondary">
          <MjIcon name="plus"></MjIcon>
          New Task
        </MjButton>
      </div>
    </MjContainer>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';

// types
import { Task, RootState } from '@/store/index';

export default Vue.extend({
  data: function () {
    return {
      loading: false
    }
  },
  computed: mapState({
    allChecked: (state: any) => {
      return state.tasks.length === state.tasks.filter((task: Task) => task.complete).length;
    },
    tasks: (state: any): Task[] => {
      return state.tasks;
    }
  }),
  methods: {
    createTask: async function () {
      try {
        this.loading = true;
        const task = await this.$store.dispatch('createTask');

        const ref = this.$refs['task-' + task.id] as any[];
        const inputs = ref && ref[0] && ref[0].$el.querySelectorAll('input');
        const input = inputs && inputs[0];
        if (input) input.focus();
        this.loading = false;
      } catch (err) {
        console.log(err);
      }
    },
    updateTask: async function (update: any, task: Task) {
      try {
        await this.$store.dispatch('updateTask', {...task, ...update});
      } catch (err) {
        console.log(err);
      }
    },
    deleteTask: async function (task: Task) {
      try {
        await this.$store.dispatch('deleteTask', task);
      } catch (err) {
        console.log(err);
      }
    },
    toggleAll: function () {
      console.log('toggle');
      const allChecked = this.allChecked;

      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i];
        this.updateTask({complete: !allChecked}, task)
      }
    }
  }
});

</script>
