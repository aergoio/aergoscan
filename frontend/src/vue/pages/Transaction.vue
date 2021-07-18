<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Transaction Details" :annotation="txDetail ? txDetail.tx.hash : ''" />
          
        <div v-if="!txDetail && !error">Loading...</div>

        <p v-if="error">{{error}}</p>
        
        <div v-if="txDetail">
          <div class="transaction-flow-diagram">
            <AccountBox :address="txDetail.tx.from" />
            <span class="flow-arrow"></span>
            <AccountBox v-if="txDetail.tx.to && txDetail.tx.to.toString().length" :address="txDetail.tx.to" />
            <div class="account-box null-address" v-if="!txDetail.tx.to || !txDetail.tx.to.toString().length">Contract Creation</div>
          </div>
          
          <table class="detail-table">
            <tr><td>Amount:</td><td v-html="$options.filters.formatToken(txDetail.tx.amount, 'aergo')"></td></tr>
            <tr v-if="txReceipt">
              <td>Fee:</td>
              <td>
                <span v-html="$options.filters.formatToken(this.txReceipt.fee)" />
                <span v-if="txReceipt.feeDelegation" class="has-tooltip tooltipped-s" v-tooltip="'Fee was paid by contract'">
                  (delegated)
                </span>
              </td>
            </tr>
            <tr><td>Gas used:</td><td>
              {{txReceipt ? txReceipt.gasused : '...'}} of
              <span v-if="txDetail.tx.limit">{{txDetail.tx.limit}}</span>
              <span v-if="!txDetail.tx.limit" class="has-tooltip tooltipped-s" v-tooltip="'Limit was set to 0, allowing unlimited gas use'">∞</span>
            </td></tr>
            <tr><td>Nonce:</td><td>{{txDetail.tx.nonce}}</td></tr>
            <tr><td>Type:</td><td>{{typeLabel}}</td></tr>
            <tr v-if="txDetail.tx.payload">
              <td>Payload:</td>
              <td>{{txDetail.tx.payload.length}} bytes</td>
            </tr>
            <tr v-if="!txDetail.block">
              <td>Status:</td>
              <td>Pending</td>
            </tr>
            <tr v-if="txDetail.block">
              <td>Status:</td>
              <td>Confirmed</td>  
            </tr>
            <tr v-if="txDetail.block">
              <td nowrap>Included in block:</td>
              <td class="monospace"><router-link :to="`/block/${txDetail.block.hash}/`">{{txDetail.block.hash}}</router-link></td>
            </tr>
            <tr v-if="txMeta.ts">
              <td>Time stamp:</td>
              <td>{{moment(txMeta.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')}} ({{moment(txMeta.ts).fromNow()}})</td>
            </tr>
          </table>
          
        </div>
      </Island>

      <Island v-if="txReceipt">
        <IslandHeader title="Execution Details" />
        <h3>Contract</h3>
        <div style="display: flex; margin-bottom: 1em">
          <AccountBox v-if="txReceipt.contractaddress" :address="txReceipt.contractaddress" />
        </div>

        <div class="side-by-side">
          <div>
            <h3>Payload</h3>

            <Tabs theme="dark" :value="selectedPayloadTab" :routeReplace="true" style="margin-bottom: 1em">
              <Tab title="Formatted" :route="{ query: query({payload: 'formatted'}) }">
                <div class="aergo-tab-content aergo-tab-content-bar" v-if="txDetail.tx.payload.length">{{formattedTitle}}</div>
                <div class="aergo-tab-content" :class="{'empty-result': !txDetail.tx.payload.length}">
                  <PayloadFormatter :payload="txDetail.tx.payload" :txType="txDetail.tx.type" :recipient="txDetail.tx.to" v-if="txDetail.tx.payload" />
                  <span v-if="!txDetail.tx.payload.length">(No payload)</span>
                </div>
              </Tab>
              <Tab title="JSON" :route="{ query: query({payload: 'json'}) }">
                <div class="aergo-tab-content monospace"><pre>{{payloadJson}}</pre></div>
              </Tab>
              <Tab title="Hex" :route="{ query: query({payload: 'hex'}) }">
                <div class="aergo-tab-content monospace">{{payloadHex}}</div>
              </Tab>
            </Tabs>

          </div>

          <div>
            <h3>Result</h3>

            <Tabs theme="dark" :value="selectedReceiptTab" :routeReplace="true">
              <Tab title="Formatted" :route="{ query: query({receipt: 'formatted'}) }">
                <div class="aergo-tab-content aergo-tab-content-bar">
                  <span v-if="txReceipt.status=='SUCCESS' || txReceipt.status=='CREATED'" class="icon status-icon icon-medium icon-success"></span>
                  <span v-if="txReceipt.status=='ERROR'" class="icon status-icon icon-medium icon-fail"></span>
                  {{statusFormatted}}
                </div>
                <div class="aergo-tab-content tx-result" :class="{'empty-result': !txReceipt.result}">
                  <span class="monospace" v-if="txReceipt.result">{{txReceipt.result}}</span>
                  <span v-if="!txReceipt.result">(Empty result)</span>
                </div>
              </Tab>
              <Tab title="JSON" :route="{ query: query({receipt: 'json'}) }">
                <div class="aergo-tab-content monospace"><pre>{{receiptJson}}</pre></div>
              </Tab>
              <Tab title="Events" :route="{ query: query({receipt: 'events'}) }">
                <EventsList :address="txReceipt.contractaddress" :blockno="txReceipt.blockno" />
              </Tab>
            </Tabs>
          </div>
        </div>
      </Island>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import AccountBox from '../components/AccountBox';
import PayloadFormatter from '../components/PayloadFormatter';
import EventsList from '../components/EventsList';
import cfg from '../../config';
import { Tabs, Tab } from 'aergo-ui/src/components/tabs';
import { TxTypes } from '@herajs/common';

const payloadTabs = ['formatted', 'json', 'hex'];
const receiptTabs = ['formatted', 'json', 'events'];

export default {
  data () {
    return {
      txDetail: null,
      txReceipt: null,
      txMeta: {},
      eventsJson: null,
      error: null,
      selectedPayloadTab: 0,
      selectedReceiptTab: 0
    }
  },
  created () {
  },
  watch: {
    '$route' (to, from) {
      this.load();
    },
  },
  mounted () {
    if (this.$route.query.payload) {
      this.selectedPayloadTab = payloadTabs.indexOf(this.$route.query.payload) || 0;
    }
    if (this.$route.query.receipt) {
      this.selectedReceiptTab = receiptTabs.indexOf(this.$route.query.receipt) || 0;
    }
    this.load();
  },
  beforeDestroy () {
  },
  components: {
    AccountBox,
    PayloadFormatter,
    Tabs, Tab,
    EventsList,
  },
  computed: {
    formattedTitle() {
      if (!this.txDetail.tx.to || !this.txDetail.tx.to.toString().length) return 'Contract Creation';
      try {
        let payloadBuffer = Buffer.from(this.txDetail.tx.payload);
        let parsedData = JSON.parse(payloadBuffer.toString());
        return 'Function Call';
      } catch(e) {
        return 'Text';
      }
    },
    statusFormatted() {
      const status = this.txReceipt.status.toLowerCase();;
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    payloadJson() {
      if (!this.txDetail.tx.payload) return;
      try {
        let payloadBuffer = Buffer.from(this.txDetail.tx.payload);
        let parsedData = JSON.parse(payloadBuffer.toString());
        return JSON.stringify(parsedData, null, 2);
      } catch(e) {
        return 'Cannot parse payload as JSON';
      }
    },
    payloadHex() {
      if (!this.txDetail.tx.payload) return;
      let payloadBuffer = Buffer.from(this.txDetail.tx.payload);
      return payloadBuffer.toString('hex');
    },
    receiptJson() {
      return JSON.stringify(this.txReceipt, null, 2);
    },
    typeLabel() {
      return this.txDetail && TxTypes[this.txDetail.tx.type];
    }
  },
  methods: {
    query(newQuery) {
      return { ...this.$route.query, ...newQuery };
    },
    async load() {
      this.error = null;
      let hash = this.$route.params.hash;

      (async () => {
        try {
          this.txDetail = await this.$store.dispatch('blockchain/getTransaction', { hash });
        } catch (e) {
          this.error = '' + e;
          return;
        }
      })();
      (async () => {
        this.txReceipt = await this.$store.dispatch('blockchain/getTransactionReceipt', { hash });
      })();
      (async () => {
        const response = await (await this.$fetch.get(`${cfg.API_URL}/transactions`, { q: `_id:${hash}` })).json();
        if (response.hits.length) {
          this.txMeta = response.hits[0].meta;
        }
      })();
      
    },
    moment
  },
};
</script>

<style lang="scss">
.transaction-flow-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;

  .flow-arrow {
    display: inline-block;
    border: 8px solid transparent;
    border-top-color: #333;
    margin-top: 8px;
  }
}

.aergo-tab-content:last-of-type {
  min-height: 125px;
}

.status-icon {
  margin-right: 10px;
}
.tx-result {
  justify-content: center;
  display: flex;
}
.empty-result {
  color: rgba(255,255,255,0.3);
  font-size: 1.2em;
  align-items: center;
}

</style>