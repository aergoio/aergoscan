<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Accounts" :annotation="`${totalItems}`">
          <div style="align-self: center; margin-left: auto;">
            <ReloadButton :action="reload"/>
          </div>
        </IslandHeader>

        <p>This page shows recently active accounts only.</p>

        <p v-if="error" class="error">{{error}}</p>
        
        <DataTable
          ref="table"
          class="accounts-table"
          :data="data || []"
          :load="loadTableData"
          :headerFields="headerFields"
          :totalItems="totalItems"
          trackBy="hash"
          :defaultSort="sortField"
          :defaultSortDirection="sort"
          :itemsPerPage="totalItems"
        >
          <div slot="key" slot-scope="{ rowData }">
            <AccountLink :address="rowData.key" @click="$router.push(`/account/${rowData.key}/`)" />
          </div>
          <div slot="max_blockno" slot-scope="{ rowData }">
            <router-link :to="`/block/${rowData.max_blockno}/`">{{rowData.max_blockno}}</router-link>
          </div>
          <div slot="hash" slot-scope="{ rowData }">
            <router-link :to="`/transaction/${rowData.hash}/`">{{rowData.hash}}</router-link>
          </div>
        </DataTable>
      </Island>
    </div>
  </div>
</template>

<script>
import ReloadButton from '../components/ReloadButton';
import { Amount } from '@herajs/client';
import aergo from '../../controller';
import moment from 'moment';
import cfg from '../../config';
import { DataTable } from 'aergo-ui/src/components/tables';
import AccountLink from "aergo-ui/src/components/AccountLink";

export default {
  data: function() {
    return {
      error: '',
      headerFields: [
        {
          name: "key",
          label: "Address",
          customElement: 'key',
        },
        {
          name: "ts",
          label: "Last Tx",
          format: (ts) => moment(ts).fromNow()
        },
        {
          name: "hash",
          label: "Tx Hash",
          customElement: 'hash'
        },
        {
          name: "max_blockno",
          label: "Block No",
          sortable: true,
          customElement: 'max_blockno'
        }
        
      ],
      data: [],
      sort: "desc",
      sortField: "max_blockno",
      totalItems: 0
    };
  },
  methods: {
    loadTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/accounts`, {
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.objects.length) {
        this.data = response.objects.map(item => ({ ...item, hash: item.tx.hash, ts: item.tx.ts }))
        this.totalItems = response.objects.length;
      }
    },
    reload: async function() {
      this.$refs.table._load();
    }
  },
  components: {
    DataTable,
    AccountLink,
    ReloadButton,
  }
};
</script>

<style lang="scss">
.accounts-table {
  font-size: .95em;

  tbody {
    td:nth-child(1),
    td:nth-child(3) {
      width: 50%;
      max-width: 0;
    }
    td:nth-child(2) {
      white-space: nowrap;
    }
    td:nth-child(4) {
      white-space: nowrap;
      text-align: right;
    }
  }
}
</style>