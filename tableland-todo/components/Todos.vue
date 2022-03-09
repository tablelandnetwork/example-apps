<template>
  <div class="flex items-top items-center sm:pt-0">
    <MjContainer v-if="listName" class="text-center">
      <MjHeadline class="text-orbitron">{{ listName }}</MjHeadline>
      <div class="my-4 mx-auto w-64 h-6">
        <div class="text-left text-poppins">
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
        <div v-for="task in tasksInMem" :key="task.id" class="m-auto w-64">
          <div class="flex">
            <MjCheckbox
              v-model="task.complete"
              @change="val => updateTask({complete: val}, task)"
              class="flex self-center mr-4"
            >
            </MjCheckbox>
            <MjInput
              v-model="task.name"
              @input="val => updateTask({name: val}, task)"
              placeholder="Choose a name..."
              :ref="'task-' + task.id"
              class="text-poppins"
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
        <MjButton class="mt-2 ml-8 text-poppins" :loading="loading" :disabled="loading" @click="createTask" variant="secondary">
          <MjIcon name="plus"></MjIcon>
          New Task
        </MjButton>
      </div>

      <div v-if="deletedTasks.length" class="m-auto w-64 text-center">
        <MjLink v-if="!showingDeleted" @click="showDeleted" color="gray" class="cursor-pointer text-poppins">
          show deleted
        </MjLink>
        <MjLink v-if="showingDeleted" @click="hideDeleted" color="gray" class="cursor-pointer text-poppins">
          hide deleted
        </MjLink>
      </div>

      <div v-if="showingDeleted" v-for="task in deletedTasks" :key="task.id" class="m-auto w-64">
        <div class="flex">
          <MjCheckbox
            :options="task.complete"
            disabled
            class="flex self-center mr-4"
          >
          </MjCheckbox>
          <MjInput
            :value="task.name"
            disabled
            placeholder="Choose a name..."
            :ref="'task-' + task.id"
            class="text-poppins"
          >
            <template #icon #suffix>
              <MjIcon name="edit-2"></MjIcon>
            </template>
          </MjInput>
        </div>
      </div>
    </MjContainer>
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';

// types
import { Task, RootState } from '@/store/index';
import { getErrorMessage } from '@/utils/index';

interface MemTask extends Task {
  dirty: boolean;
};

const delay = 3000;
export default Vue.extend({
  data: function () {
    return {
      loading: false,
      showingDeleted: false,

      tasksInMem: [] as MemTask[]
    }
  },
  computed: mapState({
    allChecked: function (state: any) {
      return this.tasks.length === this.tasks.filter((task: Task) => task.complete).length;
    },
    tasks: (state: any): Task[] => {
      return state.tasks.filter((task: Task) => !task.deleted);
    },
    deletedTasks: (state: any): Task[] => {
      return state.tasks.filter((task: Task) => task.deleted);
    },
    listName: (state: any) => state.currentTableName
  }),
  watch: {
    // keeping Flux pattern in place and allowing users to type fast and make updates by
    // watching changes and updating the ui state as they come back.  This also handles
    // the 2 browser window problem
    tasks: function (tasks: any[]) {
      const update = tasks.map((task: Task) => {
        const memTask = this.tasksInMem.find(t => t.id === task.id);
        if (memTask && !this.tasksAreSame(memTask, task)) {
          // If we end up in side this conditional it means we sent an update to the Tableland network, and
          // the task was changed again before the response returned. Example: the user is checking and unchecking
          // a task, or typing super fast!
          // In this case we don't want to update the inmemory task becasue there's another request in progress
          // that will return with the new updates
          return memTask;
        }

        return {...task, dirty: false} as MemTask;
      });

      this.tasksInMem = update;
    }
  },
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
        await this.$store.dispatch('alert', {
          message: getErrorMessage(err)
        });
      }
    },
    updateTask: async function (update: any, task: MemTask) {
      try {
        task.dirty = true;
        await this.$store.dispatch('updateTask', {...task, ...update});
      } catch (err) {
        console.log(err);
        await this.$store.dispatch('alert', {
          message: getErrorMessage(err)
        });
      }
    },
    deleteTask: async function (task: MemTask) {
      try {
        await this.$store.dispatch('deleteTask', task);
      } catch (err) {
        console.log(err);
        await this.$store.dispatch('alert', {
          message: getErrorMessage(err)
        });
      }
    },
    tasksAreSame: function (a: Task | MemTask, b: Task | MemTask) {
      if (a.id !== b.id) return false;
      if (a.name !== b.name) return false;
      if (a.complete !== b.complete) return false;
      if (a.deleted !== b.deleted) return false;

      return true;
    },
    toggleAll: async function () {
      try {
        console.log('toggle');
        const allChecked = this.allChecked;

        for (let i = 0; i < this.tasksInMem.length; i++) {
          const task = this.tasksInMem[i];
          await this.updateTask({complete: !allChecked}, task)
        }
      } catch (err) {
        console.log(err);
        await this.$store.dispatch('alert', {
          message: getErrorMessage(err)
        });
      }
    },
    showDeleted: async function () {
      this.showingDeleted = true;
    },
    hideDeleted: function () {
      this.showingDeleted = false;
    }
  }
});

</script>
