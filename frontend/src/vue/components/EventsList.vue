<template>
  <table class="aergo-tab-content events-table">
    <thead>
      <tr>
        <th v-if="columns.indexOf('blockno') >= 0">Block</th>
        <th v-if="columns.indexOf('tx') >= 0">Tx</th>
        <th>Event Name</th>
        <th>Arguments</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in events" :key="`${row.txhash}${row.eventidx}`">
        <td v-if="columns.indexOf('blockno') >= 0"><router-link :to="`/block/${row.blockhash}/`">{{row.blockno}}</router-link></td>
        <td v-if="columns.indexOf('tx') >= 0"><router-link :to="`/transaction/${row.txhash}/`">{{row.txhash}}</router-link></td>
        <td>
          {{row.eventName}}
          <div v-if="`${row.address}` !== `${address}`">@ <router-link :to="`/account/${row.address}/`">{{`${row.address}`.substr(0, 5)}}...</router-link></div></td>
        <td width="100%"><span class="event-args">
          <span class="args-payload" v-if="row.args.length"><pre><ArgFormatter v-for="arg of row.args" :key="`${arg}`" :arg="arg" class="monospace" /></pre></span>
        </span></td>
      </tr>
      <tr v-if="!events || !events.length">
        <td colspan="100%">No events found.</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { Address } from '@herajs/client';
const ArgFormatter = {
  name: 'ArgFormatter',
  props: ['arg'],
  render(h) {
    if (this.arg._bignum) {
      return h('span', this.arg._bignum);
    }
    let content = [JSON.stringify(this.arg, null, 2)];
    try {
      const addr = new Address(this.arg);
      if (!addr.isName) { // names could be other values, too, so only format true addresses
        content = [h('router-link', { props: { to: `/account/${encodeURIComponent(this.arg)}/` } }, [ this.arg ])];
      }
    } catch (e) {
      // Keep basic JSON formatting
    }
    return h('span', content);
  }
};

export default {
  props: ['events', 'columns', 'address'],
  data () {
    return {};
  },
  components: {
    ArgFormatter,
  }
};
</script>

<style lang="scss">
.events-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .95em;

  th, td {
    text-align: left;
    border-bottom: 1px solid #444;
    padding: 10px;
    vertical-align: top;
  }
  th {
    padding-top: 32px;
    white-space: nowrap;
  }
}
.event-args {
  word-break: break-all;
  pre {
    margin: 0;
    font-size: .95em;
  }
}
</style>
