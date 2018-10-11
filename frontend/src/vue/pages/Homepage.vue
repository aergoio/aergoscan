<template>
  <div class="wrap">
    <div class="page-content">

      <div class="chart-wrap">
        <div class="chart-header">
          <div class="chart-title">
            <span class="title">Transaction History</span>
            (Last: <span class="stat-value">{{reverseBlocks[0].body.txsList.length}}</span> Max: <span class="stat-value">{{maxTps}}</span>)
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
        <div class="island">
          <div class="island-title">Blocks</div>
          <RecentBlocks class="island-content" />
        </div>

        <div class="island">
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

export default {
  data () {
    return {
      txChartUnit: 'second',
      txStats: {}
    }
  },
  created () {
  },
  mounted () {
    this.$store.dispatch('blockchain/streamBlocks');
    this.updateStats();
  },
  beforeDestroy () {
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
    txData() {
      console.log('Updating chart data');
      let source;
      const stats = this.txStats;
      if (this.txChartUnit == 'second') {
        source = this.blocks;
        return source.map(item => ({
          x: item.header.timestamp/1000000,
          y: item.body.txsList.length
        }));
      }
      if (this.txChartUnit == 'minute') source = stats.txPerMinute;
      if (this.txChartUnit == 'hour') source = stats.txPerHour;
      if (this.txChartUnit == 'day') source = stats.txPerDay;
      if (!source) return {};
      return source.map(item => ({
        x: item.key,
        y: item.sum_txs.value
      }));
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
      const response = await this.$fetch.get('https://api.aergoscan.io/stats/stats');
      this.txStats = await response.json();
      setTimeout(() => {
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
  transition: transform .75s;
}
.animated-list-enter-active/*, .animated-list-leave-to*/ {
  transition: all .75s;
}
.animated-list-enter, .animated-list-leave-to {
  opacity: 0;
}

.stat-value {
  color: #F90F5F;
  font-weight: 500;
}

.chart-wrap {
  margin-bottom: 25px;
  .chart {
    margin: 15px 0;
  }
}

.chart-header {
  display: flex;

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

</style>