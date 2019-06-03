<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Blocks" :annotation="`${totalItems}`">
          <div style="align-self: center; margin-left: auto;">
            <ReloadButton :action="reload"/>
          </div>
        </IslandHeader>

        <p v-if="error" class="error">{{error}}</p>
        
        <DataTable
          ref="table"
          class="blocks-table"
          :data="data || []"
          :load="loadTableData"
          :headerFields="headerFields"
          :totalItems="totalItems"
          trackBy="hash"
          :defaultSort="sortField"
          :defaultSortDirection="sort"
        >
          <div slot="no" slot-scope="{ rowData }">
            <router-link :to="`/block/${rowData.no}/`">{{rowData.no}}</router-link>
          </div>
          <div slot="hash" slot-scope="{ rowData }">
            <router-link :to="`/block/${rowData.hash}/`">{{rowData.hash}}</router-link>
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
          name: "no",
          label: "Block No",
          sortable: true,
          customElement: 'no',
        },
        {
          name: "ts",
          label: "Timestamp",
          sortable: true,
          format: (ts) => moment(ts).format('dddd, MMMM Do YYYY, HH:mm:ss'),
        },
        {
          name: "hash",
          label: "Hash",
          sortable: false,
          customElement: 'hash',
        },
        {
          name: "txs",
          label: "Transactions",
          sortable: true,
        },
        {
          name: "size",
          label: "Size",
          sortable: true,
        },
      ],
      data: [],
      sort: "desc",
      sortField: "no",
      totalItems: 0
    };
  },
  methods: {
    loadTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/blocks`, {
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => ({ ...item.meta, hash: item.hash }));
        this.totalItems = response.total;
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
.blocks-table {
  font-size: .95em;

  tbody {
    td:nth-child(2) {
      white-space: nowrap;
    }
    td:nth-child(3) {
      width: 100%;
      max-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    td:nth-child(4),
    td:nth-child(5) {
      white-space: nowrap;
      text-align: right;
    }
  }
}
</style>