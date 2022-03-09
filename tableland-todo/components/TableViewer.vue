<template>
  <MjContainer>
    <MjRow>
      <MjInput placeholder="list name" class="text-poppins" v-model.trim="newName"></MjInput>
      <MjButton class="ml-2 text-poppins" :loading="loading" :disabled="invalidName || loading" @click="createTable" variant="secondary">
        <MjIcon name="plus"></MjIcon>
        Mint a List
      </MjButton>
    </MjRow>
    <MjRow class=py-4>
      <MjNote v-if="invalidName" variant="danger" class="text-poppins">
        Name is not valid. List names must be unique. List names must start with a letter and can only include alphanumeric characters and the underscore.
      </MjNote>
    </MjRow>

    <MjRow class="mt-4">
      <MjTable density="tight">
        <MjTableHead>
          <MjTableHeader class="text-orbitron">
            Your Lists
          </MjTableHeader>
        </MjTableHead>

        <MjTableBody>
          <MjTableRow v-for="table in allTables" :key="table.table_id" clickable @click="loadTable(table)" class="text-poppins">
            <MjTableCell>
              {{ table.list_name }}
            </MjTableCell>
          </MjTableRow>
        </MjTableBody>
      </MjTable>
    </MjRow>
  </MjContainer>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';

import { getErrorMessage } from '@/utils/index';

export default Vue.extend({
  data: function () {
    return {
      loading: false as boolean,
      newName: '' as string
    };
  },
  computed: {
    invalidName: function () {
      const name = this.newName;
      if (!name) return false;

      if (name[0].match(/[^a-zA-Z]/)) return true;
      if (this.allTables.find((list: any) => list.list_name === name)) {
        return true;
      }

      return false;
    },
    ...mapState({
      allTables: (state: any) => state.listTable
    })
  },
  methods: {
    createTable: async function () {
      try {
        if (!this.newName) {
          await this.$store.dispatch('alert', {message: 'Please Choose a name for your list'});
          return;
        }

        if (this.invalidName) {
          await this.$store.dispatch('alert', {message: 'Sorry the name you chose is not valid. Please make sure the name states with a letter, and only contains letters numbers and the underscore.  Also, names must be unique, so make sure the name isn\'t already being used'});
          return;
        }

        this.loading = true;

        const table = await this.$store.dispatch('createList', {name: this.newName});
        this.newName = '';
        this.loading = false;
      } catch (err) {
        console.log(err);
        await this.$store.dispatch('alert', {
          message: getErrorMessage(err)
        });
      }
    },
    loadTable: async function (table: any) {
      try {
        await this.$store.dispatch('loadTable', {name: table.table_name});
      } catch (err) {
        console.log(err);
        await this.$store.dispatch('alert', {
          message: getErrorMessage(err)
        });
      }
    }
  }
});

</script>
