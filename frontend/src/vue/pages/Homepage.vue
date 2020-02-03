<template>
  <div class="wrap">
    <div class="page-content">

      <div class="stats">
        <div class="stat">
          <router-link class="stat-value" :to="`/block/${reverseBlocks[0].hash}/`" v-if="reverseBlocks.length">{{reverseBlocks[0].header.blockno | formatNumber('&#8239;')}}</router-link>
          <div class="stat-value loading" v-if="!reverseBlocks.length"></div>
          <div class="stat-label">last<br>block</div>
        </div>
        <div class="stat">
          <div class="stat-value" v-if="txTotal !== false">{{txTotal | formatNumber('&#8239;')}}</div>
          <div class="stat-value loading" v-if="txTotal === false"></div>
          <div class="stat-label">total<br>tx</div>
        </div>
        <div class="stat tooltipped-s" v-tooltip="'Peak transaction number. Click to go to block'">
          <router-link class="stat-value" :to="`/block/${maxTps.hash}/`" v-if="maxTps">{{maxTps.meta.txs | formatNumber('&#8239;')}}</router-link>
          <div class="stat-value loading" v-if="!maxTps"></div>
          <div class="stat-label">tps<br>(peak)</div>
        </div>
        <div class="stat tooltipped-s" v-tooltip="'Transactions in the last minute'">
          <div class="stat-value" v-if="txPerMinute !== false">{{txPerMinute | formatNumber('&#8239;')}}</div>
          <div class="stat-value loading" v-if="txPerMinute === false"></div>
          <div class="stat-label">tpm<br>(now)</div>
        </div>
        <div class="stat tooltipped-s" v-tooltip="'Number of block producers. Click to go to list'">
          <router-link class="stat-value" :to="`/consensus/`" v-if="consensusInfo">{{bpNumber}}</router-link>
          <div class="stat-value loading" v-if="!consensusInfo"></div>
          <div class="stat-label">BP<br>number</div>
        </div>
      </div>

      <div class="chart-wrap">
        <div class="chart-header">
          <div class="chart-title">
            <span class="title">Transaction History</span>
          </div>
          <div class="chart-selector">
            <span class="option" :class="{active: txChartUnit=='second'}" v-on:click="selectMode('second')">60 seconds</span>
            <span class="option" :class="{active: txChartUnit=='minute'}" v-on:click="selectMode('minute')">60 minutes</span>
            <span class="option" :class="{active: txChartUnit=='hour'}" v-on:click="selectMode('hour')">24 hours</span>
            <span class="option" :class="{active: txChartUnit=='day'}" v-on:click="selectMode('day')">30 days</span>
          </div>
        </div>
        <TxChart :data="txData" :unit="txChartUnit" />
      </div>

      <div class="side-by-side">
        <Island style="flex: 1">
          <IslandHeader title="Blocks" />
          <RecentBlocks />
          <div style="text-align: center; padding-top: 10px;">
            <router-link :to="{name: 'blocks'}" class="btn">View all</router-link>
          </div>
        </Island>

        <Island style="flex: 2">
          <IslandHeader title="Transactions" />
          <RecentTransactions />
          <div style="text-align: center; padding-top: 10px;">
            <router-link :to="{name: 'transactions'}" class="btn">View all</router-link>
          </div>
        </Island>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { mapState, mapActions } from 'vuex'
import RecentBlocks from '../components/RecentBlocks';
import RecentTransactions from '../components/RecentTransactions';
import TxChart from '../components/TxChart';
import cfg from '../../config.js';
import { Island, IslandHeader } from "aergo-ui/src/components/layout";

export default {
  data () {
    return {
      txChartUnit: 'second',
      txStats: {},
      initialTxStats: {},
      initialStatsLoaded: false,
      realTimeStats: [],
      statsTimeout: null,
      consensusInfo: null,
    }
  },
  created () {
  },
  mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
    this.updateStats();
    
  },
  beforeDestroy () {
    if (this.statsTimeout) {
      clearTimeout(this.statsTimeout);
    }
  },
  computed: {
    ...mapState({
      blocks: state => state.blockchain.recentBlocks,
      chainInfo: state => state.blockchain.chainInfo
    }),
    reverseBlocks() {
      return this.blocks.slice().reverse();
    },
    maxTps() {
      return this.txStats.maxTps;
    },
    txTotal() {
      return typeof this.txStats.txTotal !== 'undefined' ? this.txStats.txTotal : false;
    },
    txPerMinute() {
      return typeof this.txStats.txPerMinute !== 'undefined' ? this.txStats.txPerMinute[this.txStats.txPerMinute.length-1].sum_txs.value : false;
    },
    bpNumber() {
      if (this.consensusInfo && this.consensusInfo.info && this.consensusInfo.info.Total) {
        return Number(this.consensusInfo.info.Total);
      }
      if (this.chainInfo && this.chainInfo.bpnumber) {
        return this.chainInfo.bpnumber;
      }
      return 0;
    },
    txData() {
      let source;
      const stats = this.txStats;
      let dbData = [];
      if (this.txChartUnit == 'second') source = this.initialTxStats.txPerSecond;
      if (this.txChartUnit == 'minute') source = stats.txPerMinute;
      if (this.txChartUnit == 'hour') source = stats.txPerHour;
      if (this.txChartUnit == 'day') source = stats.txPerDay;
      if (source) {
        dbData = source.map(item => ({
          x: item.key,
          y: item.sum_txs.value
        }));
      }

      // Extra handling for seconds for smooth chart
      if (this.txChartUnit == 'second' && this.blocks.length > 0) {
        // initialize with db data if present
        if (this.realTimeStats.length === 0 && dbData.length > 0) {
          this.realTimeStats.push(...dbData);
        }
        if (this.realTimeStats.length === 0 && this.blocks.length > 1) {
          this.realTimeStats.push(...this.blocks.map(b => ({
            x: Math.trunc(b.header.timestamp/1000000000)*1000,
            y: b.txcount
          })));
        }
        // add new block
        const newBlock = this.blocks[this.blocks.length - 1];
        this.realTimeStats.push({
          x: Math.trunc(newBlock.header.timestamp/1000000000)*1000,
          y: newBlock.txcount
        });
        // remove old blocks
        while (this.realTimeStats.length > 60) {
          this.realTimeStats.shift();
        }

        return this.realTimeStats;
      }
      return dbData;
    }
  },
  methods: {
    viewBlock (blockNo) {
      this.$router.push(`/block/${blockNo}`);
    },
    selectMode (mode) {
      this.txChartUnit = mode;
    },
    async loadConsensus() {
      this.consensusInfo = Object.freeze(await this.$store.dispatch('blockchain/getConsensusInfo'));
    },
    async updateStats () {
      if (!this.consensusInfo) {
        this.loadConsensus();
      }
      try {
        const response = await this.$fetch.get(`${cfg.API_URL}/tx`);
        this.txStats = await response.json();
        if (!this.initialStatsLoaded) {
          this.initialTxStats = this.txStats;
          this.initialStatsLoaded = true;
        }
      } catch (e) {
        console.error('Failed to connect to stats API: ' + e);
      }
      this.statsTimeout = setTimeout(() => {
        this.updateStats();
      }, 10000);
    },
    moment
  },
  components: {
    RecentBlocks,
    RecentTransactions,
    TxChart,
    Island, IslandHeader
  }
};
</script>

<style lang="scss">

.animated-list-move {
  transition: transform .5s;
}
.animated-list-enter-active/*, .animated-list-leave-to*/ {
  transition: all .5s;
}
.animated-list-enter, .animated-list-leave-to {
  opacity: 0;
}

.chart-wrap {
  margin-bottom: 25px;
  .chart {
    margin: 15px 0;
  }
}
.chart-header {
  display: flex;
  align-items: baseline;

  @media (max-width: 40em) {
    flex-direction: column;
    align-items: center;

    .chart-title {
      margin-bottom: 1em;
    }
  }

  .chart-title {
    flex: 1;
    .title {
      font-weight: 500;
    }
  }
  .chart-selector {
    border: 2px solid #FF36AD;
    border-radius: 100px;
    padding: 2px;
    display: flex;
    text-transform: uppercase;
    font-size: .8em;

    .option {
      border-radius: 100px;
      line-height: 2.25;
      cursor: pointer;
      padding: 0 12px;
      margin-right: 2px;
      &:last-child {
        margin-right: 0;
      }
      &:hover {
        background-color: #fff;
      }
      &.active {
        color: #fff;
        background-color: #FF36AD;
      }
      transition: all .24s;
    }
  }
}

.stats {
  display: flex;
  flex-wrap: wrap;
  margin: 0 0 -10px;
  

  .stat {
    background-color: #fff;
    padding: 7px;
    min-width: 4em;
    height: 4em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 25px;
    margin-bottom: 25px;

    .stat-label {
      text-align: center;
      text-transform: uppercase;
      font-size: .9em;
      letter-spacing: .05em;
    }
    .stat-value {
      text-align: center;
      color: #FF0097;
      font-weight: 500;
      font-size: 1.5em;
      border: 0;

      &.loading {
        animation: dotLoading steps(3, end) infinite 1.5s;

        &:after {
          content: "·";
        }
      }
    }
  }
}
@keyframes dotLoading {
  from {
    text-indent: -10px;
  }
  to {
    text-indent: 10px;
  }
}
</style>