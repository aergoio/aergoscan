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
            <tr v-if="accountTokens && accountTokens.length">
              <td>{{accountTokens.length}} Tokens:</td>
              <td><span class="btn-toggle" :class="{open: showTokenBalances}" @click="showTokenBalances = !showTokenBalances">View balances</span></td>
            </tr>
            <template v-if="accountTokens && showTokenBalances">
              <tr v-for="accountToken in accountTokens" :key="accountToken.key" class="token-balance">
                <td>
                  <AccountLink :address="accountToken.key" :name="accountToken.token.meta.name" @click="$router.push(`/account/${accountToken.key}/`)" />
                <td>
                  <span v-if="accountToken.balance" v-html="$options.filters.formatGenericToken(formatTokenAmount(accountToken.balance, '', accountToken.token.meta.decimals), accountToken.token.meta.symbol)"></span>
                  <span v-else>...</span>
                </td>
              </tr>
            </template>
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

      <Island v-if="token">
        <IslandHeader :title="`${token.meta.type} Token`" />
        <table class="detail-table">
          <tr>
            <td>Name:</td>
            <td>{{token.meta.name}}</td>
          </tr>
          <tr>
            <td>Symbol:</td>
            <td>{{token.meta.symbol}}</td>
          </tr>
          <tr v-if="token.meta.supply">
            <td>Supply:</td>
            <td>{{token.meta.supply}}</td>
          </tr>
          <tr v-if="token.meta.decimals">
            <td>Decimals:</td>
            <td>{{token.meta.decimals}}</td>
          </tr>
          <tr>
            <td>Created in transaction:</td>
            <td><router-link :to="`/transaction/${token.meta.tx_id}/`">{{token.meta.tx_id}}</router-link></td>
          </tr>
        </table>
      </Island>

      <Island v-if="token || (accountDetail && !accountDetail.codehash)">
        <IslandHeader title="Token Transfers" :annotation="`${totalTokenTransfers}`" />

        <DataTable
          ref="tokenTxTable"
          class="token-transfer-table"
          :data="tokenTransfers || []"
          :load="loadTokenTableData"
          :headerFields="tokenHeaderFields"
          :totalItems="totalTokenTransfers"
          trackBy="hash"
          :defaultSort="sortField"
          :defaultSortDirection="sort"
        >
          <div slot="hash" slot-scope="{ rowData }">
            <span style="max-width: 160px; overflow: hidden; display: inline-flex">
              <router-link :to="`/transaction/${rowData.tx_id}/`">{{rowData.tx_id}}</router-link>
            </span>
          </div>
          <div slot="address" slot-scope="{ rowData }">
            <AccountLink :address="rowData.address" @click="$router.push(`/account/${rowData.address}/`)" />
          </div>
          <div slot="from" slot-scope="{ rowData }">
            <AccountLink v-if="rowData.from !== '1111111111111111111111111111111111111111111111111111'" :address="rowData.from" @click="$router.push(`/account/${rowData.from}/`)" />
            <AccountLink v-else address="" :name="rowData.from" />
          </div>
          <div slot="to" slot-scope="{ rowData }">
            <AccountLink v-if="rowData.to !== '1111111111111111111111111111111111111111111111111111'" :address="rowData.to" @click="$router.push(`/account/${rowData.to}/`)" />
            <AccountLink v-else address="" :name="rowData.to" />
          </div>
          <div slot="amount" slot-scope="{ rowData }">
            <span v-if="rowData.token_id">{{rowData.token ? rowData.token.meta.symbol : ''}} <span class="token-id">{{rowData.token_id}}</span></span>
            <span v-else>{{
              token
              ? formatTokenAmount(rowData.amount, token.meta.symbol, token.meta.decimals)
              : rowData.token
                ? formatTokenAmount(rowData.amount, rowData.token.meta.symbol, rowData.token.meta.decimals)
                : rowData.amount}}</span>
          </div>
        </DataTable>
      </Island>

      <Island v-if="accountDetail && accountDetail.codehash">
        <IslandHeader title="Contract" />
        <ContractAbi :abi="contractAbi" :codehash="accountDetail.codehash" :address="realAddress" style="margin-bottom: 30px" />
      </Island>

      <Island v-if="accountDetail">
        <IslandHeader title="Transactions" :annotation="`${totalItems}`" />

        <DataTable
          ref="txTable"
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
          <div slot="category" slot-scope="{ rowData }">
            <span class="label">{{rowData.category}}</span>
          </div>
        </DataTable>
      </Island>
    </div>
  </div>
</template>

<script>
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

function formatTokenAmount(amount, unit, decimals) {
  return `${Amount.moveDecimalPoint(amount, -decimals)}${unit? ` ${unit}` : ''}`;
}

export default {
  data () {
    return {
      address: '',
      contractAbi: null,
      transactions: [],
      error: null,
      accountDetail: null,
      staking: null,
      ownerAddress: null,
      destinationAddress: null,
      token: null,
      totalTokenTransfers: 0,
      tokenTransfers: [],
      accountTokens: [],
      names: [],
      nameHistory: [],
      showTokenBalances: false,

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
          name: "category",
          label: "Category",
          sortable: false,
          customElement: 'category',
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
  watch: {
    '$route' (to, from) {
      if (to.path !== from.path) {
        this.load();
      }
    },
    'realAddress' () {
      if (this.$refs.txTable) {
        this.$refs.txTable._load();
      }
      if (this.$refs.tokenTxTable) {
        this.$refs.tokenTxTable._load();
      }
    },
    'showTokenBalances'() {
      if (this.showTokenBalances) {
        this.accountTokens.map(async (token) => {
          const balance = await this.$store.dispatch('blockchain/getTokenBalance', { token: token.key, address: this.address });
          token.balance = balance;
        });
      }
    }
  },
  mounted () {
    this.load();
  },
  components: {
    AccountBox,
    ContractAbi,
    TransactionList,
    DataTable,
    AccountLink,
  },
  computed: {
    tokenHeaderFields() {
      return [
        {
          name: "ts",
          label: "Timestamp",
          sortable: true,
          format: (value) => moment(value).fromNow()
        },
        {
          name: "hash",
          label: "TX Hash",
          sortable: false,
          customElement: 'hash',
        },
        !this.token && {
          name: "address",
          label: "Token",
          customElement: "address",
        },
        {
          name: "from",
          label: "From",
          sortable: true,
          customElement: 'from',
        },
        {
          name: "to",
          label: "To",
          sortable: true,
          customElement: 'to',
        },
        {
          name: "amount_float",
          label: this.token ? this.token.meta.type === 'ARC2' ? "ID" : "Amount" : "Amount or ID",
          sortable: true,
          customElement: 'amount',
        },
      ].filter(a => a);
    },
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
      this.token = null;
      this.accountTokens = [];
      let isName = false;
      this.showTokenBalances = false;

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
        if (address.isName && !address.isSystemAddress()) {
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

      this.address = address;

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
          const staking = await this.$store.dispatch('blockchain/getStaking', { address });
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

      // Token balances
      (async() => {
        const fetch = await this.$fetch.get(`${cfg.API_URL}/accountTokens`, {
          address
        });
        try {
          const response = await fetch.json();
          if (response.error) {
            console.error(response.error);
          }
          if (response.objects) {
            this.accountTokens = response.objects.map(v => ({...v, balance: null}));
          }
        } catch (e) {
          console.error(e);
        }
      })();

      // Contract and transactions
      try {
        if (this.accountDetail.codehash) {
          this.$store.dispatch('blockchain/getABI', { address }).then(abi => this.contractAbi = abi);

          (async () => {
            try {
              const response = await this.$fetch.get(`${cfg.API_URL}/token`, { q: `_id:${this.$route.params.address}`, size: 1 });
              const data = (await response.json());
              this.token = data.hits[0];
            } catch (e) {
              console.error(e);
            }
          })();
        }
      } catch (e) {
        console.error(e);
      }
    },
    loadTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const fetch = await this.$fetch.get(`${cfg.API_URL}/transactions`, {
        q: `from:${this.realAddress} OR to:${this.realAddress}`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      });
      const response = await fetch.json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.transactions = response.hits.map(item => ({ ...item.meta, hash: item.hash }));
        this.totalItems = response.total;
      }
    },
    loadTokenTableData: async function({ sortField, sort, currentPage, itemsPerPage }) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const fetch = await this.$fetch.get(`${cfg.API_URL}/tokenTransfers`, {
        q: this.token ? `address:${this.realAddress}` : `to:${this.realAddress} OR from:${this.realAddress}`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      });
      const response = await fetch.json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.tokenTransfers = response.hits.map(item => ({ ...item.meta, token: item.token, hash: item.hash }));
        this.totalTokenTransfers = response.total;
      }
    },
    moment,
    formatTokenAmount,
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
    td:nth-child(5) {
      white-space: nowrap;
      text-align: right;
    }
  }
}
.token-transfer-table {
  font-size: .95em;
  tbody {
    td:last-child {
      white-space: nowrap;
    }
  }
}
.label-account-wrap {
  display: flex;
  .label {
    margin-right: 5px;
  }
}
.token-transfer-table .account-link {
  max-width: 160px;
}
.token-id {
  display: inline-block;
  font-family: monospace;
  background-color: #f0f0f0;
  border-radius: 3px;
  padding: 0 3px;
  line-height: 2;
}

.btn-toggle {
  color: #FF0097;
  cursor: pointer;
  &:after {
    content: "▼";
    font-size: .8em;
    margin-left: .2em;
  }
  &.open:after {
    content: "▲";
  }
}

.token-balance td {
  padding: 5px 5px 7px;
}
</style>