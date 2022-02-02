<template>
  <MjContainer>
    <MjRow>
      <MjInput placeholder="list name" v-model.trim="newName"></MjInput>
      <MjButton class="ml-2" :loading="loading" :disabled="invalidName || loading" @click="createTable" variant="secondary">
        <MjIcon name="plus"></MjIcon>
        New Todo List
      </MjButton>
    </MjRow>
    <MjRow class=py-4>
      <MjNote v-if="invalidName" variant="danger">
        Name is not valid. List names must be unique. List names must start with a letter and can only include alphanumeric characters and the underscore.
      </MjNote>
    </MjRow>

    <MjRow class="mt-4">
      <MjParagraph>Your Lists</MjParagraph>
      <MjTable density="tight">
        <MjTableHead>
          <MjTableHeader>
            Name
          </MjTableHeader>
        </MjTableHead>

        <MjTableBody>
          <MjTableRow v-for="table in allTables" :key="table.uuid" clickable @click="loadTable(table)">
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
      if (name.includes(' ')) return true;
      if (name[0].match(/[^a-zA-Z]/)) return true;
      if (name.match(/[^a-zA-Z_0-9]/)) return true;
      if (this.allTables.find((list: any) => list.list_name === name)) {
        return true;
      }

      return false;
    },
    ...mapState({
      allTables: (state: any) => state.allTables
    })
  },
  methods: {
    createTable: async function () {
      if (!this.newName) {
        await this.$store.dispatch('alert', {message: 'Please Choose a name for your list'});
        return;
      }

      if (this.invalidName) {
        await this.$store.dispatch('alert', {message: 'Sorry the name you chose is not valid. Please make sure there are no spaces, the name states with a letter, and only contains letters numbers and the underscore.  Also, names must be unique, so make sure the name isn\'t already being used'});
        return;
      }

      this.loading = true;

      const table = await this.$store.dispatch('createTable', {name: this.newName});
      this.newName = '';
      this.loading = false;
    },
    loadTable: async function (table: any) {
      await this.$store.dispatch('loadTable', {tableId: table.uuid, name: table.list_name});
    }
  }
});

</script>
