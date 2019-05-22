<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader title="Chain Info" />
        <div v-if="error" class="error">{{error}}</div>

        <div v-if="!chainInfo || !chainInfo.chainid">Loading...</div>

        <div class="multicol" v-if="chainInfo && chainInfo.chainid">
          <dl class="table kvtable">
            <dt>Chain ID</dt>
            <dd>{{chainInfo.chainid.magic}}</dd>

            <dt>Public</dt>
            <dd>{{chainInfo.chainid.public}}</dd>

            <dt>Mainnet</dt>
            <dd>{{chainInfo.chainid.mainnet}}</dd>

            <dt>Maximum block size</dt>
            <dd>{{chainInfo.maxblocksize}}</dd>

            <dt>Total token supply</dt>
            <dd v-html="$options.filters.formatToken(chainInfo.maxtokens, 'aergo')"></dd>

            <dt>Minimum staking amount</dt>
            <dd v-html="$options.filters.formatToken(chainInfo.stakingminimum, 'aergo')"></dd>

            <dt>Consensus</dt>
            <dd>{{chainInfo.chainid.consensus}}</dd>

            <dt>BP number</dt>
            <dd>{{chainInfo.bpnumber}}</dd>
          </dl>
        </div>
      </Island>

      <Island>
        <IslandHeader title="BP List">
          <div style="align-self: center;">
            <ReloadButton :action="load"/>
          </div>
        </IslandHeader>

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
      </Island>
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
</style>