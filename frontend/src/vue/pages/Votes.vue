<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Top 50 Votes
          <ReloadButton :action="load" style="float: right" />
        </div>
        <div class="island-content">
          <div v-if="error" class="error">{{error}}</div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Peer ID</th>
                <th style="text-align: right">Votes</th>
              </tr>
            </thead>
            <tr v-for="(item, index) in votesList" :key="item.candidate">
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
  methods: {
    async load() {
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
</style>