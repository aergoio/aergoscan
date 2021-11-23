<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Tokens" :annotation="`${totalItems}`">
          <div style="align-self: center; margin-left: auto;">
            <select v-model="type">
              <option value="">All types</option>
              <option :value="type" v-for="type in Types" :key="type">{{type}}</option>
            </select>
          </div>
          <div style="align-self: center; margin-left: 10px;">
            <ReloadButton :action="reload"/>
          </div>
        </IslandHeader>

        <p>This page shows tokens that were indexed by Aergoscan.
          If you deployed an ARC1 (standard token) or ARC2 (NFT) compliant contract and it doesn't show up here, please contact us.</p>

        <p v-if="error" class="error">{{error}}</p>
        
        <DataTable
          ref="table"
          class="tokens-table"
          :data="data || []"
          :load="loadTableData"
          :headerFields="headerFields"
          :totalItems="totalItems"
          trackBy="hash"
          :defaultSort="sortField"
          :defaultSortDirection="sort"
          :itemsPerPage="20"
        >
          <div slot="hash" slot-scope="{ rowData }">
            <AccountLink :address="rowData.hash" @click="$router.push(`/account/${rowData.hash}/`)" />
          </div>
          <div slot="blockno" slot-scope="{ rowData }">
            <router-link :to="`/block/${rowData.blockno}/`">{{rowData.blockno}}</router-link>
          </div>
        </DataTable>
      </Island>
    </div>
  </div>
</template>

<script>
import ReloadButton from '../components/ReloadButton';
import cfg from '../../config';
import { DataTable } from 'aergo-ui/src/components/tables';
import AccountLink from "aergo-ui/src/components/AccountLink";

const Types = ["ARC1", "ARC2"];

export default {
  data: function() {
    return {
      error: '',
      itemsPerPage: 20,
      headerFields: [
        {
          name: "blockno",
          label: "Block No",
          sortable: true,
          customElement: 'blockno'
        },
        {
          name: "hash",
          label: "Address",
          customElement: 'hash',
        },
        {
          name: "name",
          label: "Name",
          sortable: true,
        },
        {
          name: "symbol",
          label: "Symbol",
          sortable: true,
        },
        {
          name: "supply",
          label: "Supply",
        },
        {
          name: "type",
          label: "Type",
        },
      ],
      data: [],
      sort: "desc",
      sortField: "blockno",
      totalItems: 0,
      Types,
      type: "",
    };
  },
  methods: {
    loadTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const params = {
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      };
      if (this.type !== '') {
        params.q =`type:"${this.type}"`;
      }
      const response = await (await this.$fetch.get(`${cfg.API_URL}/token`, params)).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => ({ ...item.meta, hash: item.hash }));
        this.totalItems = response.total;
      } else {
        this.data = [];
        this.totalItems = 0;
      }
    },
    reload: async function() {
      this.$refs.table._load();
    },
  },
  watch: {
    type() {
      this.reload();
    },
  },
  components: {
    DataTable,
    AccountLink,
    ReloadButton,
  }
};
</script>

<style lang="scss">
.tokens-table {
  font-size: .95em;

  tbody {
    td:nth-child(1) {
      width: 10%;
      max-width: 0;
    }
    td:nth-child(2) {
      width: 50%;
      max-width: 0;
    }
  }
}
</style>