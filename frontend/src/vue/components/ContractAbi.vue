<template>
  <div>
    <div class="view-selector">
      <div class="view-option" :class="{active: viewMode=='abi'}" v-on:click="setViewMode('abi')">ABI (JSON)</div>
      <div class="view-option" :class="{active: viewMode=='interactive'}" v-on:click="setViewMode('interactive')">Interactive</div>
      <!--<div class="view-option" :class="{active: viewMode=='code'}" v-on:click="setViewMode('code')">Codehash</div>-->
      <div class="view-option" :class="{active: viewMode=='events'}" v-on:click="setViewMode('events')">Events</div>
    </div>
    <div class="view-box">
      <div v-if="viewMode=='abi'">
        <div class="monospace code-highlight code-highlight-pre" v-html="formattedAbi"></div>
      </div>
      <div v-if="viewMode=='interactive'">
        <div class="monospace interactive-contract code-highlight">
          <div v-if="abi.functions.length == 0">Contract has no public functions.</div>
          <div v-for="(func, idx) in functions" :key="func.name" class="function-block">
            <span class="function">{{func.name}}</span>(<span v-if="func.arguments.length">{<br>
              <span v-for="(arg, idx) in func.arguments" :key="arg.name">
                &nbsp;&nbsp;<span class="key">{{arg.name}}</span>: <input type="text" v-model="interactiveArguments[func.name][arg.name]" class="arg-field"> <span v-if="idx!=func.arguments.length-1">, </span><br>
              </span>
            }</span>)
            <span class="btn-call" v-if="!isLoading[idx]" v-on:click="queryContract(idx)">Query</span>
            <span class="btn-call" v-if="isLoading[idx]">Loading...</span>
            <div v-if="typeof interactiveResults[idx] !== 'undefined' && interactiveResults[idx] !== null" class="code-highlight-pre">-> <span v-html="syntaxHighlight(interactiveResults[idx])"></span></div>
          </div>
        </div>
      </div>
      <div v-if="viewMode=='code'">
        <div class="monospace" style="max-width: 29em">
          <p>{{codehash.length}} bytes</p>
          <div v-html="formattedCode" />
        </div>
      </div>
      <div v-if="viewMode=='events'">
        <p style="float: right">
          <ReloadButton :action="loadNewEvents" />
        </p>
        Showing {{events.length}} events from block number <span class="loadedNumber">{{eventsFromMin}}</span> to <span class="loadedNumber">{{eventsToMax}}</span>.
        <span v-on:click="loadPreviousEvents" v-if="canLoadMoreEvents && !isLoadingMoreEvents" class="btn-call">Load more</span>
        <span v-if="isLoadingMoreEvents" class="btn-call">Loading...</span>
        <span v-if="!canLoadMoreEvents">Loaded all events</span>

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
        
      </div>
    </div>
  </div>
</template>

<script>
import { loadAndWait } from '../utils/async';
import ReloadButton from './ReloadButton';

const defaultdict = (def) => new Proxy({}, {
  get: (target, name) => name in target ? target[name] : def
});

const eventPage = 10000;

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

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
    }
  },
  created () {
    
  },
  watch: {
    '$route' (to, from) {
    },
    'viewMode' (to, from) {
      if (to === 'events') {
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
  },
  computed: {
    functions() {
      return this.abi.functions.map(func => ({...func, results: [1]}));
    },
    formattedAbi() {
      if (!this.$props.abi) return '';
      return syntaxHighlight(this.$props.abi);
    },
    formattedCode() {
      if (!this.codehash) return '';
      const buf = Buffer.from(this.codehash);
      //return Buffer.from(this.accountDetail.codehash).toString();
      return Array.from(buf).map (b => b.toString (16).padStart (2, "0")).join (" ");
    },
    canLoadMoreEvents() {
      return this.eventsFromMin > 0;
    }
  },
  methods: {
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
      this.bestBlock = await this.$store.dispatch('blockchain/getBestBlock');
      this.eventsTo = this.eventsFrom || this.bestBlock.bestHeight;
      this.eventsFrom = Math.max(0, this.eventsTo - eventPage);
      if (loadNew) {
        this.eventsTo = this.bestBlock.bestHeight;
        this.eventsFrom = this.eventsToMax + 1;
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
    async queryContract(funcIdx) {
      const wait = loadAndWait();

      const name = this.functions[funcIdx].name;
      const args = this.interactiveArguments[name];
      const argValues = this.functions[funcIdx].arguments.map(arg => args[arg.name]);
      if (argValues.some(item => typeof item === 'undefined')) {
        this.$set(this.interactiveResults, funcIdx, {
          error: 'You did not provide all arguments'
        });
        return;
      }

      this.$set(this.isLoading, funcIdx, true);
      this.$set(this.interactiveResults, funcIdx, null);

      let results;
      try {
        results = await this.$store.dispatch('blockchain/queryContract', {
          name,
          args: argValues,
          abi: this.abi,
          address: this.address
        });
      } catch(e) {
        results = {error: e};
      }
      await wait();
      this.$set(this.interactiveResults, funcIdx, results);
      this.$set(this.isLoading, funcIdx, false);
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
  white-space: pre;
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