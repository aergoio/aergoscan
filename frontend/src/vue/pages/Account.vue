<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Account Details" />
  
        <div class="transaction-flow-diagram">
          <AccountBox v-if="accountDetail" :address="realAddress" :label="$route.params.address" />
        </div>
        
        <div v-if="error">Error: {{error}}</div>

        <div v-if="!accountDetail && !error">Loading...</div>

        <div v-if="accountDetail">
          <table class="detail-table">
            <tr v-if="destinationAddress">
              <td>Alias for:</td>
              <td><router-link :to="`/account/${destinationAddress}/`">{{destinationAddress}}</router-link></td>
            </tr>
            <tr v-if="ownerAddress && ownerAddress != destinationAddress">
              <td>Name owned by:</td>
              <td><router-link :to="`/account/${ownerAddress}/`">{{ownerAddress}}</router-link></td>
            </tr>
            <tr><td>Balance:</td><td>
              <span v-html="$options.filters.formatToken(fullBalance, 'aergo')"></span>
            </td></tr>
            <tr v-if="staking">
              <td>– Staked amount:</td>
              <td>
                <span v-html="$options.filters.formatToken(staking.amount, 'aergo')"></span>
                <span v-if="staking.when">
                  (since block <router-link :to="`/block/${staking.when}/`">{{staking.when}}</router-link>)
                </span>
              </td>
            </tr>
            <tr v-if="staking">
              <td>– Unstaked amount:</td>
              <td>
                <span v-html="$options.filters.formatToken(unstakedBalance, 'aergo')"></span>
              </td>
            </tr>
            <tr><td>Nonce:</td><td>{{accountDetail.nonce}}</td></tr>
          </table>
        </div>
      </Island>

      <Island v-if="namesCurrent.length">
        <IslandHeader title="Registered names" :annotation="`${realAddress}`" />
        <div class="table-like">
          <div class="row header">
            <div class="cell" style="flex: 5">Name</div>
            <div class="cell" style="flex: 2">Since Block</div>
            <div class="cell" style="flex: 5">Transaction</div>
          </div>
          <div class="row linearize" v-for="name in namesCurrent" :key="name.tx">
            <div class="cell" style="flex: 5"><router-link :to="`/account/${name.name}/`">{{name.name}}</router-link></div>
            <div class="cell" style="flex: 2"><router-link :to="`/block/${name.blockno}/`">{{name.blockno}}</router-link></div>
            <div class="cell hash" style="flex: 5"><router-link :to="`/transaction/${name.tx}/`">{{name.tx}}</router-link></div>
          </div>
        </div>
      </Island>

      <Island v-if="namesPrevious.length">
        <IslandHeader title="Previously registered names" :annotation="`${realAddress}`" />
        <div class="table-like" v-if="namesPrevious.length">
          <div class="row header">
            <div class="cell" style="flex: 5">Name</div>
            <div class="cell" style="flex: 2"></div>
            <div class="cell" style="flex: 5">Current destination</div>
          </div>
          <div class="row linearize" v-for="name in namesPrevious" :key="name.tx">
            <div class="cell" style="flex: 5"><router-link :to="`/account/${name.name}/`">{{name.name}}</router-link></div>
            <div class="cell" style="flex: 2"></div>
            <div class="cell" style="flex: 5">
              <router-link :to="`/account/${name.currentAddress}/`">{{name.currentAddress}}</router-link>
            </div>
          </div>
        </div>
      </Island>

      <Island v-if="nameHistory.length">
        <IslandHeader title="Name History" :annotation="`${$route.params.address}`" />
        <div class="table-like" v-if="nameHistory.length">
          <div class="row header">
            <div class="cell" style="flex: 2">Since Block</div>
            <div class="cell" style="flex: 6">Destination</div>
            <div class="cell" style="flex: 1"></div>
            <div class="cell" style="flex: 5">Transaction</div>
          </div>
          <div class="row linearize" v-for="name in nameHistory" :key="name.tx">
            <div class="cell" style="flex: 2"><router-link :to="`/block/${name.blockno}/`">{{name.blockno}}</router-link></div>
            <div class="cell" style="flex: 6">
              <router-link :to="`/account/${name.address}/`">{{name.address}}</router-link>
              <span v-if="name.address == realAddress" class="label">current</span>
            </div>
            <div class="cell" style="flex: 1"></div>
            <div class="cell" style="flex: 5"><router-link :to="`/transaction/${name.tx}/`">{{name.tx}}</router-link></div>
          </div>
        </div>
      </Island>

      <Island v-if="accountDetail && accountDetail.codehash">
        <IslandHeader title="Contract" />
        <ContractAbi :abi="contractAbi" :codehash="accountDetail.codehash" :address="realAddress" style="margin-bottom: 30px" />
      </Island>

      <Island v-if="accountDetail">
        <IslandHeader title="Transactions" :annotation="`${totalItems}`" />

        <DataTable
          ref="table"
          class="account-transactions-table"
          :data="transactions || []"
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
            <template v-if="rowData.from !== rowData.to">
              <span v-if="addressMatches(rowData.to)" class="label-account-wrap"><span class="label label-negative">from</span>&nbsp;<AccountLink :address="rowData.from" @click="$router.push(`/account/${rowData.from}/`)" /></span>
              <span v-else class="label-account-wrap"><span class="label label-positive">to</span>&nbsp;<AccountLink :address="rowData.to" @click="$router.push(`/account/${rowData.to}/`)" /></span>
            </template>
            <template v-else><span class="label label-neutral">self transfer</span></template>
          </div>
        </DataTable>
      </Island>
    </div>
  </div>
</template>

<script>
import aergo from '../../controller';
import moment from 'moment';
import AccountBox from '../components/AccountBox';
import ContractAbi from '../components/ContractAbi';
import TransactionList from '../components/TransactionList';
import cfg from '../../config.js';
import { Address } from '@herajs/client';
import JSBI from 'jsbi';
import { Amount } from '@herajs/client';
import { DataTable } from 'aergo-ui/src/components/tables';
import AccountLink from "aergo-ui/src/components/AccountLink";

export default {
  data () {
    return {
      contractAbi: null,
      transactions: [],
      error: null,
      accountDetail: null,
      staking: null,
      ownerAddress: null,
      destinationAddress: null,
      names: [],
      nameHistory: [],

      headerFields: [
        {
          name: "ts",
          label: "Timestamp",
          sortable: true,
          format: (value) => moment(value).fromNow()
        },
        {
          name: "hash",
          label: "Hash",
          sortable: false,
          customElement: 'hash',
        },
        {
          name: "from",
          label: "From -> To",
          sortable: false,
          customElement: 'from',
        },
        {
          name: "amount",
          label: "Amount",
          sortable: true,
          format: (amount) => new Amount(amount, 'aer').toUnit('aergo').toString()
        }
      ],
      sort: "desc",
      sortField: "ts",
      totalItems: 0,
    }
  },
  created () {
  },
  watch: {
    '$route' (to, from) {
      if (to.path !== from.path) {
        this.load();
        this.data = [];
        if (this.$refs.table) {
          this.$refs.table._load();
        }
      }
    },
    'realAddress' (to, from) {
      if (this.$refs.table) {
          this.$refs.table._load();
        }
    },
  },
  mounted () {
    this.load();
  },
  beforeDestroy () {
  },
  components: {
    AccountBox,
    ContractAbi,
    TransactionList,
    DataTable,
    AccountLink,
  },
  computed: {
    realAddress() {
      return this.destinationAddress || this.$route.params.address;
    },
    fullBalance() {
      if (!this.staking) {
        return this.accountDetail.balance;
      }
      return new Amount(JSBI.add(this.accountDetail.balance.value, this.staking.amount.value).toString(), 'aer');
    },
    unstakedBalance() {
      return this.accountDetail.balance;
    },
    namesCurrent() {
      if (this.realAddress && this.names.length)
        return this.names.filter(name => name.currentAddress == this.realAddress);
      return [];
    },
    namesPrevious() {
      if (this.realAddress && this.names.length)
        return this.names.filter(name => name.currentAddress != this.realAddress);
      return [];
    }
  },
  methods: {
    addressMatches(addr) {
      return addr === this.$route.params.address || addr === this.realAddress;
    },
    async load() {
      let address;
      this.error = null;
      this.ownerAddress = null;
      this.destinationAddress = null;
      this.staking = null;
      this.accountDetail = null;
      this.contractAbi = null;
      this.names = [];
      this.nameHistory = [];
      let isName = false;

      // Check address
      try {
        address = new Address(this.$route.params.address);
        isName = address.isName;
      } catch (e) {
        this.error = 'Invalid address';
        console.error(e);
        return;
      }
      
      // Owner
      try {
        if (address.isName && ['aergo.name', 'aergo.system'].indexOf(address.toString()) === -1) {
          const nameInfo = await this.$store.dispatch('blockchain/getNameInfo', { name: address.encoded });
          this.ownerAddress = nameInfo.owner.toString();
          this.destinationAddress = nameInfo.destination.toString();
          address = this.destinationAddress;
        }
      } catch (e) {
        this.error = 'Unregistered name';
        console.error(e);
        return;
      }

      // State
      try {
        this.accountDetail = Object.freeze(await this.$store.dispatch('blockchain/getAccount', { address }));
      } catch (e) {
        this.error = 'Account not found';
        console.error(e);
        return;
      }

      // Staking
      (async () => {
        try {
          let staking = await this.$store.dispatch('blockchain/getStaking', { address });
          this.staking = Object.freeze(staking);
        } catch (e) {
          console.error(e);
        }
      })();

      // Assigned names
      (async () => {
        try {
          if (!address.isName) {
            const response = await this.$fetch.get(`${cfg.API_URL}/names`, { q: `address:${address}`, size: 10 });
            const data = (await response.json());
            const names = data.hits;
            for (let name of names) {
              const response = await this.$fetch.get(`${cfg.API_URL}/names`, { q: `name:${name.name}`, size: 1 });
              const data = (await response.json());
              name.currentAddress = data.hits[0].address;
            }
            this.names = names;
          }
        } catch (e) {
          console.error(e);
        }
      })();
      
      // Name history
      if (isName) {
        (async () => {
          try {
            const response = await this.$fetch.get(`${cfg.API_URL}/names`, { q: `name:${this.$route.params.address}`, size: 10, sort: 'blockno:asc' });
            const data = (await response.json());
            this.nameHistory = data.hits;
            console.log(this.nameHistory);
          } catch (e) {
            console.error(e);
          }
        })();
      }
      

      // Contract and transactions
      try {
        if (this.accountDetail.codehash) {
          this.contractAbi = await this.$store.dispatch('blockchain/getABI', { address });
        }
      } catch (e) {
        console.error(e);
      }
    },
    loadTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/transactions`, {
        q: `from:${this.realAddress} OR to:${this.realAddress}`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.transactions = response.hits.map(item => ({ ...item.meta, hash: item.hash }));
        this.totalItems = response.total;
      }
    },
    moment
  },
};
</script>

<style lang="scss">
.account-transactions-table {
  font-size: .95em;
  tbody {
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
.label-account-wrap {
  display: flex;
  .label {
    margin-right: 5px;
  }
}
</style>