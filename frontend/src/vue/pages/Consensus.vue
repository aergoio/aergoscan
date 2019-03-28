<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Chain Info
        </div>
        <div class="island-content">
          <div v-if="error" class="error">{{error}}</div>

          <div v-if="!chainInfo || !chainInfo.chainid">Loading...</div>

          <table class="kv-table" v-if="chainInfo && chainInfo.chainid">
            <tr><th>Chain ID</th><td>{{chainInfo.chainid.magic}}</td></tr>
            <tr><th>Public</th><td>{{chainInfo.chainid.public}}</td></tr>
            <tr><th>Mainnet</th><td>{{chainInfo.chainid.mainnet}}</td></tr>
            <tr><th>Maximum block size</th><td>{{chainInfo.maxblocksize}}</td></tr>
            <tr><th>Total token supply</th><td v-html="$options.filters.formatToken(chainInfo.maxtokens, 'aergo')"></td></tr>
            <tr><th>Minimum staking amount</th><td v-html="$options.filters.formatToken(chainInfo.stakingminimum, 'aergo')"></td></tr>
            <tr><th>Consensus</th><td>{{chainInfo.chainid.consensus}}</td></tr>
            <tr><th>BP number</th><td>{{chainInfo.bpnumber}}</td></tr>
          </table>
        </div>
        <div class="island-title">
          BP List
          <ReloadButton :action="load" style="float: right" />
        </div>
        <div class="island-content">

          <div v-if="!votesList || !votesList.length">Loading...</div>

          <table class="data-table" v-if="votesList && votesList.length">
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Peer ID</th>
                <th style="text-align: right">Votes</th>
              </tr>
            </thead>
            <tr v-for="(item, index) in votesList" :key="item.candidate" :class="{highlight: $route.query.highlight === item.candidate, lastSelected: bpNumber && bpNumber === (index+1)}">
              <td>{{index+1}}</td>
              <td class="monospace">
                <Identicon :text="item.candidate" size="16" class="mini-identicon" />
                {{item.candidate}}
              </td>
              <td style="text-align: right">
                {{item.amount.toUnit('aergo').toString()}}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReloadButton from '../components/ReloadButton';
import moment from 'moment';
import Identicon from '../components/Identicon';
import { mapState } from 'vuex'

export default {
  data () {
    return {
      votesList: null,
      error: null,
    }
  },
  created () {
  },
  watch: {
    '$route' (to, from) {
      this.load();
    }
  },
  mounted () {
    this.load();
  },
  beforeDestroy () {
  },
  computed: {
    ...mapState({
      chainInfo: state => state.blockchain.chainInfo
    }),
    bpNumber() {
      if (this.chainInfo && this.chainInfo.bpnumber) {
        return this.chainInfo.bpnumber;
      }
      return 0;
    }
  },
  methods: {
    async load() {
      (async () => {
        try {
          const votesList = await this.$store.dispatch('blockchain/getTopVotes', { count: 50 });
          for (let vote of votesList) {
            vote.amount = Object.freeze(vote.amount); // prevent Vue from adding observer to Amount
          }
          this.votesList = votesList;
        } catch (e) {
          this.error = '' + e;
          console.error(e);
        }
      })();

      (async () => {
        this.consensusInfo = Object.freeze(await this.$store.dispatch('blockchain/getConsensusInfo'));
        console.log(this.consensusInfo);
      })();
    },
    moment,
  },
  components: {
    ReloadButton,
    Identicon,
  },
};
</script>

<style lang="scss">
.highlight td {
  background-color: rgba(255, 188, 0, 0.1);
}
.lastSelected td {
  border-color: #FF36AD;
  border-width: 2px;
}
.kv-table {
  background-color: #FAFAFA;
  border-collapse: collapse;
  min-width: 350px;
  margin: 0 0 1em;
  
  td, th {
    border-bottom: 1px solid #E4E4E4;
    line-height: 2rem;
    padding: 0 1rem 0 .75rem;
  }
  th {
    font-weight: 500;
    text-align: left;
    white-space: nowrap;
  }
  tr:last-child {
    td, th {
      border-bottom: 0;
    }
  }
}
</style>