<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Transactions" :annotation="`${totalItems}`">
          <div style="align-self: center; margin-left: auto;">
            <ReloadButton :action="reload"/>
          </div>
        </IslandHeader>

        <p v-if="error" class="error">{{error}}</p>
        
        <DataTable
          ref="table"
          class="transactions-table"
          :data="data || []"
          :load="loadTableData"
          :headerFields="headerFields"
          :totalItems="totalItems"
          trackBy="hash"
          :defaultSort="sortField"
          :defaultSortDirection="sort"
        >
          <div slot="blockno" slot-scope="{ rowData }">
            <router-link :to="`/block/${rowData.blockno}/`">{{rowData.blockno}}</router-link>
          </div>
          <div slot="hash" slot-scope="{ rowData }">
            <router-link :to="`/transaction/${rowData.hash}/`">{{rowData.hash}}</router-link>
          </div>
          <div slot="from" slot-scope="{ rowData }">
            <AccountLink :address="rowData.from" @click="$router.push(`/account/${rowData.from}/`)" />
          </div>
          <div slot="to" slot-scope="{ rowData }">
            <AccountLink :address="rowData.to" @click="$router.push(`/account/${rowData.to}/`)" />
          </div>
          <div slot="category" slot-scope="{ rowData }">
            <span class="label">{{rowData.category}}</span>
          </div>
          <div slot="amount" slot-scope="{ rowData }">
            <span v-html="$options.filters.formatToken(rowData.amount, 'aergo')"></span>
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
          name: "blockno",
          label: "Block No",
          sortable: true,
          customElement: 'blockno',
        },
        {
          name: "hash",
          label: "Hash",
          sortable: false,
          customElement: 'hash',
        },
        {
          name: "from",
          label: "Sender",
          sortable: false,
          customElement: 'from',
        },
        {
          name: "to",
          label: "Recipient",
          sortable: false,
          customElement: 'to',
        },
        {
          name: "category",
          label: "Category",
          sortable: false,
          customElement: 'category',
        },
        {
          name: "amount_float",
          label: "Amount",
          sortable: true,
          customElement: 'amount',
        }
      ],
      data: [],
      sort: "desc",
      sortField: "blockno",
      totalItems: 0
    };
  },
  methods: {
    loadTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/transactions`, {
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
.transactions-table {
  font-size: .95em;

  tbody {
    td:nth-child(3),
    td:nth-child(4) {
      width: 50%;
      max-width: 0;
    }
    td:nth-child(5) {
      white-space: nowrap;
      text-align: right;
    }
  }
}
</style>