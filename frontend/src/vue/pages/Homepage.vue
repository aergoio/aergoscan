<template>
  <div class="wrap">
    <div class="page-content">

      <div class="stats">
        <div class="stat">
          <div class="stat-value" v-if="reverseBlocks.length">{{reverseBlocks[0].header.blockno | formatNumber('&#8239;')}}</div>
          <div class="stat-value" v-if="!reverseBlocks.length">...</div>
          <div class="stat-label">last<br>block</div>
        </div>
        <div class="stat tooltipped-s" v-tooltip="'Transaction number in most recent block'">
          <div class="stat-value" v-if="reverseBlocks.length">{{reverseBlocks[0].txcount | formatNumber('&#8239;')}}</div>
          <div class="stat-value" v-if="!reverseBlocks.length">...</div>
          <div class="stat-label">tps<br>(now)</div>
        </div>
        <div class="stat tooltipped-s" v-tooltip="'Peak transaction number'">
          <router-link class="stat-value" :to="`/block/${maxTps.hash}/`" v-if="maxTps">{{maxTps.meta.txs | formatNumber('&#8239;')}}</router-link>
          <div class="stat-value" v-if="!maxTps">...</div>
          <div class="stat-label">tps<br>(peak)</div>
        </div>
        <div class="stat">
          <div class="stat-value" v-if="txTotal">{{txTotal | formatNumber('&#8239;')}}</div>
          <div class="stat-value" v-if="!txTotal">...</div>
          <div class="stat-label">total<br>tx</div>
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
        <div class="island" style="flex: 1">
          <div class="island-title">Blocks</div>
          <RecentBlocks class="island-content" />
        </div>

        <div class="island" style="flex: 2">
          <div class="island-title">Transactions</div>
          <RecentTransactions class="island-content" />
        </div>
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

export default {
  data () {
    return {
      txChartUnit: 'second',
      txStats: {},
      initialTxStats: {},
      initialStatsLoaded: false,
      realTimeStats: [],
      statsTimeout: null,
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
      blocks: state => state.blockchain.recentBlocks
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
    async updateStats () {
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
    TxChart
  }
};
</script>

<style lang="scss">
.icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-repeat: no-repeat;
  background-size: contain;
}
.icon-view {
  background-image: url('~@assets/img/view.svg');
}
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
    border: 2px solid #F90F5F;
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
        background-color: #F90F5F;
      }
      transition: all .24s;
    }
  }
}

.stats {
  display: flex;
  margin: 0 0 15px;

  .stat {
    background-color: #fff;
    padding: 7px;
    min-width: 4em;
    height: 4em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 25px;

    .stat-label {
      text-align: center;
      text-transform: uppercase;
      font-size: .9em;
      letter-spacing: .05em;
    }
    .stat-value {
      text-align: center;
      color: #F90F5F;
      font-weight: 500;
      font-size: 1.5em;
    }
  }
}

</style>