<template>
  <div>
    <Tabs theme="dark" :value="selectedTab" @tab-change="tabChanged" :routeReplace="true">
      <Tab title="ABI (JSON)" :route="{ query: query({tab: 'abi'}) }"><div class="aergo-tab-content">
        <div class="monospace code-highlight code-highlight-pre" v-html="formattedAbi"></div>
      </div></Tab>
      <Tab title="Interactive" :route="{ query: query({tab: 'interactive'}) }"><div class="aergo-tab-content">
        <div class="monospace interactive-contract code-highlight">

          <div v-if="!abi">Loading...</div>
          <div v-if="abi && abi.functions.length == 0">Contract has no public functions.</div>

          <QueryFunction v-for="func in functions" :key="func.name" :abi="abi" :name="func.name" :address="address" />
          <QueryStateVariable v-for="variable in stateVariables" :key="variable.name" :abi="abi" :name="variable.name" :address="address" />
        </div>
      </div></Tab>
      <Tab title="Events" :route="{ query: query({tab: 'events'}) }"><div class="aergo-tab-content">
        <p style="float: right">
          <ReloadButton :action="loadNewEvents" />
        </p>
        Showing {{events.length}} events from block number <span class="loadedNumber">{{eventsFromMin}}</span> to <span class="loadedNumber">{{eventsToMax}}</span>.
        <span v-on:click="loadPreviousEvents" v-if="canLoadMoreEvents && !isLoadingMoreEvents" class="btn-call">Load more</span>
        <span v-if="isLoadingMoreEvents" class="btn-call">Loading...</span>
        <span v-if="!canLoadMoreEvents && !isLoadingMoreEvents">Loaded all events</span>

        <table class="event-table">
          <tr>
            <th>Event name</th>
            <th>Arguments</th>
            <th>Block</th>
            <th>Transaction</th>
          </tr>
          <tr v-for="event in events" :key="event.txhash + event.eventidx">
            <td class="monospace">{{event.eventName}}</td>
            <td class="monospace">{{event.args}}</td>
            <td><router-link :to="`/block/${event.blockhash}/`">{{event.blockno}}</router-link></td>
            <td><router-link :to="`/transaction/${event.txhash}/`">{{event.txhash}}</router-link></td>
          </tr>
        </table>
        
      </div></Tab>
    </Tabs>
  </div>
</template>

<script>
import { syntaxHighlight } from '../utils/syntax-highlight';
import { loadAndWait } from '../utils/async';
import ReloadButton from './ReloadButton';
import QueryFunction from './QueryFunction';
import QueryStateVariable from './QueryStateVariable';
import { Tabs, Tab } from 'aergo-ui/src/components/tabs';

const contractTabs = ['abi', 'interactive', 'events'];

const defaultdict = (def) => new Proxy({}, {
  get: (target, name) => name in target ? target[name] : def
});

const eventPage = 10000;

export default {
  props: ['abi', 'codehash', 'address'],
  data () {
    return {
      viewMode: 'abi',
      interactiveResults: [],
      interactiveArguments: defaultdict({}),
      isLoading: [],
      events: [],
      eventsFrom: 0,
      eventsTo: 0,
      eventsToMax: 0,
      eventsFromMin: -1,
      isLoadingMoreEvents: false,
      bestBlock: false,
      selectedTab: 0
    }
  },
  created () {
    if (this.$route.query.tab) {
      this.selectedTab = contractTabs.indexOf(this.$route.query.tab) || 0;
    }
  },
  watch: {
    'selectedTab' (to, from) {
      console.log(to);
      if (to === 2) {
        this.loadEvents();
      }
    }
  },
  mounted () {
  },
  beforeDestroy () {
  },
  components: {
    ReloadButton,
    QueryFunction,
    QueryStateVariable,
    Tabs, Tab
  },
  computed: {
    functions() {
      if (!this.abi) return [];
      return this.abi.functions.filter(func => func.name !== 'constructor');
    },
    stateVariables() {
      if (!this.abi) return [];
      return this.abi.state_variables;
    },
    formattedAbi() {
      if (!this.$props.abi) return '';
      return syntaxHighlight(this.$props.abi);
    },
    formattedCode() {
      if (!this.codehash) return '';
      const buf = Buffer.from(this.codehash);
      return Array.from(buf).map (b => b.toString (16).padStart (2, "0")).join (" ");
    },
    canLoadMoreEvents() {
      return this.eventsFromMin > 0;
    }
  },
  methods: {
    tabChanged(index) {
      this.selectedTab = index;
    },
    query(newQuery) {
      return { ...this.$route.query, ...newQuery };
    },
    setViewMode(mode) {
      this.viewMode = mode;
    },
    loadPreviousEvents() {
      this.loadEvents(true);
    },
    loadNewEvents() {
      this.loadEvents(true, true);
    },
    async loadEvents(append=false, loadNew=false) {
      const wait = loadAndWait();
      this.isLoadingMoreEvents = true;
      if (loadNew || !this.bestBlock) {
        this.bestBlock = await this.$store.dispatch('blockchain/getBestBlock');
      }
      if (loadNew) {
        this.eventsTo = this.bestBlock.bestHeight;
        this.eventsFrom = this.eventsToMax + 1;
      } else {
        this.eventsTo = this.eventsFrom || this.bestBlock.bestHeight;
        this.eventsFrom = Math.max(0, this.eventsTo - eventPage);
      }
      this.eventsToMax = Math.max(this.eventsToMax, this.eventsTo);
      this.eventsFromMin = Math.min(this.eventsFromMin, this.eventsFrom);
      if (this.eventsFromMin === -1) {
        this.eventsFromMin = this.eventsFrom;
      }
      if (!append) this.events = [];
      console.log('loading events', this.eventsFrom, this.eventsTo);
      try {
        const events = await this.$store.dispatch('blockchain/getEvents', {
          eventName: null,
          args: [],
          address: this.address,
          blockto: this.eventsTo,
          blockfrom: this.eventsFrom
        });
        await wait();
        this.events.push(...events);
      } catch(e) {
        console.error(e);
      }
      this.isLoadingMoreEvents = false;
    },
    syntaxHighlight
  },
};
</script>

<style lang="scss">
.view-selector {
  display: flex;
  margin: 0 0 0 10px;
  
  .view-option {
    padding: 0 20px;
    line-height: 2.5;
    margin-right: 4px;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    background-color: #f0f0f0;
    color: #444;


    &:hover {
      background-color: #e7e7e7;
    }

    &.active {
      background-color: #1E1E1E;
      color: #fff;
    }
  }
}
.view-box {
  background-color: #1E1E1E;
  padding: 1em;
  line-height: 1.4;
  border-radius: 4px;
  font-weight: 500;
  color: #D4D4D4;
  margin-bottom: 20px;
}
.code-highlight-pre {
  white-space: pre-wrap;
}
.code-highlight {
  .string, .boolean, .number, .null, .function {
      font-weight: 500;
  }
  .function {
    color: #FCFFA7;
  }
  .key {
    color: #9CDCFE;
  }
  .string {
    color: #D88E73;
  }
  .boolean {
    color: #569cd6;
  }
  .number {
    color: #AECFA4;
  }
  .annotation {
    color: #ccc;
  }
}
.interactive-contract {
  .function-block {
    margin-bottom: 1em;
  }
  .arg-field {
    background: rgba(255,255,255,0.1);
    border: none;
    color: #fff;
  }
}
.btn-call {
  font-size: .9em;
  cursor: pointer;
  text-transform: uppercase;
  color: #fff;
  border-radius: 3px;

  border: 1px solid #fff;
  padding: 0 4px;
  line-height: 1em;
}
.event-table {
  td, th {
    text-align: left;
    padding: 0 1em 0 0;
    line-height: 2;
    word-break: normal;
  }
  th {
    white-space: nowrap;
  }
}
.loadedNumber {
  color: #fff;
}
</style>