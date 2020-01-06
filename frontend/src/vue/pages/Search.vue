<template>
  <div class="wrap">
    <div class="page-content">
      <Island>
        <IslandHeader :title="isGo && (results.length === 1 || loading) ? 'Redirecting' : 'Search Results'" /> 
        <div v-if="loading">Please wait...</div>
        <ul class="search-results" v-if="!loading && results.length">
          <li v-for="result of results" :key="result[0] + result[1]">
            <router-link :to="urlFor(result)">
              <span class="result-type">{{labelFor(result)}}</span>
              <span class="result-text">{{result[1]}}</span>
            </router-link>
          </li>
        </ul>
        <div v-if="!loading && !results.length">No results for "{{lastQuery}}"</div>
      </Island>
    </div>
  </div>
</template>

<script>
import cfg from '../../config.js';
import { Island, IslandHeader } from "aergo-ui/src/components/layout";
import { Address } from '@herajs/client';

function removeDuplicateResults(results) {
  const types = [];
  return results.filter(result => {
    if (types.indexOf(result[0]) !== -1) {
      return false;
    }
    types.push(result[0]);
    return true;
  });
}

export default {
  data () {
    return {
      lastQuery: '',
      results: [],
      loading: false,
    }
  },
  components: {
    Island, IslandHeader,
  },
  mounted() {
    this.loadResults();
  },
  watch: {
    '$route'() {
      this.loadResults();
    }
  },
  computed: {
    isGo() {
      return this.$route.name === 'go';
    },
  },
  methods: {
    labelFor(result) {
      return {
        blockhash: 'Block Hash',
        txhash: 'Transaction Hash',
        address: 'Address',
        blockno: 'Block Number'
      }[result[0]];
    },

    urlFor(result) {
      if (result[0] === 'blockno' || result[0] === 'blockhash') {
        return `/block/${result[1]}`;
      }
      if (result[0] === 'address') {
        return `/account/${result[1]}`;
      }
      if (result[0] === 'txhash') {
        return `/transaction/${result[1]}`;
      }
    },

    async loadResults() {
      if (this.lastQuery != this.$route.query.q) {
        this.lastQuery = this.$route.query.q;
      }
      this.loading = true;
      const results = await Promise.all([this.getResultsStatic(this.lastQuery), this.getResultsApi(this.lastQuery)]);
      this.results = removeDuplicateResults([...results[0], ...results[1]]);
      this.loading = false;

      if (this.isGo && this.results.length === 1) {
        this.$router.push(this.urlFor(this.results[0]));
      }
    },

    async getResultsApi(query) {
      const results = [];
      try {
        const response = await this.$fetch.get(`${cfg.API_URL}/search`, {q: query});
        const result = await response.json();
        if (result.blocks.length) {
          results.push(['blockhash', result.blocks[0].hash]);
        }
        if (result.transactions.length) {
          results.push(['txhash', result.transactions[0].hash]);
        }
        if (result.addresses.length) {
          results.push(['address', result.addresses[0].address]);
        }
      } catch (e) {
      }
      return results;
    },

    async getResultsStatic(query) {
      const results = [];
      if ('' + parseInt(query) === query) {
        results.push(['blockno', ''+parseInt(query)]);
      }
      try {
        const addr = new Address(query);
        if (!addr.isName || addr.isSystemAddress() || addr.isName && query.length === 12) {
          results.push(['address', addr.toString()]);
        }
      } catch (e) {
      }
      return results;
    }
  },
};
</script>

<style lang="scss">
.search-results {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    
    border-bottom: 1px solid #eee;

    a {
      display: block;
      border: 0;
      padding: 15px;

      &:hover {
        background-color: #f9f9f9;
      }
    }
  }

  .result-type {
    color: #777;
    display: block;
  }

  .result-text {
    font-size: 1.25em;
  }
}
</style>