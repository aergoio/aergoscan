<template>
  <Island>
    <IslandHeader title="Transactions" :annotation="`${totalItems}`" />

    <p v-if="error" class="error">{{error}}</p>
    
    <DataTable
      ref="table"
      class="block-transactions-table"
      :data="data || []"
      :load="loadTableData"
      :headerFields="headerFields"
      :totalItems="totalItems"
      trackBy="hash"
      :defaultSort="sortField"
      :defaultSortDirection="sort"
    >
      <div slot="hash" slot-scope="{ rowData }">
        <router-link :to="`/transaction/${rowData.hash}/`">{{rowData.hash}}</router-link>
      </div>
      <div slot="from" slot-scope="{ rowData }">
        <AccountLink :address="rowData.from.toString()" @click="$router.push(`/account/${rowData.from}/`)" />
      </div>
      <div slot="to" slot-scope="{ rowData }">
        <AccountLink :address="rowData.to.toString()" @click="$router.push(`/account/${rowData.from}/`)" />
      </div>
      <div slot="amount" slot-scope="{ rowData }" v-html="$options.filters.formatToken(rowData.amount)">
      </div>
      <div slot="category" slot-scope="{ rowData }">
        <span class="label">{{rowData.category}}</span>
      </div>
    </DataTable>
  </Island>
</template>

<script>
import { Amount } from '@herajs/client';
import aergo from '../../controller';
import moment from 'moment';
import cfg from '../../config';
import { DataTable } from 'aergo-ui/src/components/tables';
import AccountLink from "aergo-ui/src/components/AccountLink";

export default {
  props: ['hash'],
  data: function() {
    return {
      error: '',
      headerFields: [
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
          name: "amount",
          label: "Amount",
          sortable: false,
          customElement: 'amount'
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
      const start = (currentPage - 1) * itemsPerPage;
      const response = await this.$store.dispatch('blockchain/fetchBlockTransactions', { hash: this.hash, offset: start, size: itemsPerPage });
      this.data = response.body.txsList.map(tx => Object.freeze(tx));
      this.totalItems = response.total;
    },
  },
  components: {
    DataTable,
    AccountLink,
  }
};
</script>

<style lang="scss">
.block-transactions-table {
  font-size: .95em;

  tbody {
    td:nth-child(2),
    td:nth-child(3) {
      width: 50%;
      max-width: 0;
    }
    td:nth-child(4) {
      white-space: nowrap;
      text-align: right;
    }
  }
}
</style>