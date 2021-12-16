<template>
  <MjContainer>
    <MjRow>
      <MjInput placeholder="list name" v-model.trim="newName"></MjInput>
      <MjButton class="ml-2" :loading="loading" :disabled="!newName || loading" @click="createTable" variant="secondary">
        <MjIcon name="plus"></MjIcon>
        New Todo List
      </MjButton>
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
          <MjTableRow v-for="table in allTables" :key="table.tableId" clickable>
            <MjTableCell @click="loadTable(table)">
              {{ table.tableId }}
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
    ...mapState({
      currentTable: state => state.currentTable,
      allTables: (state: any) => state.allTables
    })
  },
  methods: {
    createTable: async function () {
      if (!this.newName) return;

      this.loading = true;

      const table = await this.$store.dispatch('createTable', {name: this.newName});
      this.loading = false;
    },
    loadTable: async function (table) {
      await this.$store.dispatch('loadTable', {tableId: table.tableId})
    }
  }
});

</script>
