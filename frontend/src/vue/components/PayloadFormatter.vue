 <template>
  <span class="formatted-payload">
    <span class="tx-action" v-if="action">{{action}}</span>
    <span class="monospace" v-if="name">{{name}}(</span>
    <span class="monospace" :class="{block: rest.length > 100}">{{rest}}</span>
    <span v-if="address">
      <router-link :to="`/account/${address}/`">{{address}}</router-link>
    </span>
    <span v-if="address && args.length">
      ↓
    </span>
    <span class="args-payload" v-if="args.length"><pre><ArgFormatter v-for="arg of args" :key="`${arg}`" :arg="arg" class="monospace" /></pre></span>
    <span class="monospace" v-if="name">)</span>
    <span class="list-payload" v-if="listPayload.length">
      <span v-for="item of listPayload" :key="`${item}`">
        {{item}}
      </span>
    </span>

    <span class="list-payload" v-if="bps.length">
      <span v-for="item of bps" :key="`${item}`">
        <router-link :to="`/votes/?highlight=${item}`">{{item}}</router-link>
      </span>
    </span>
  </span>
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
  props: ['payload', 'txType', 'recipient'],
  data () {
    return {
      action: "",
      rest: "",
      listPayload: [],
      address: "",
      name: "",
      args: [],
      bps: []
    }
  },
  watch: {
    payload () {
      this.format();
    }
  },
  mounted () {
    this.format();
  },
  methods: {
    format() {
      if (!this.payload || !this.payload.length) {
        return;
      }
      let payloadBuffer = Buffer.from(this.payload);
      let payload = payloadBuffer.toString();
      try {
        let parsedData = JSON.parse(payload);
        let args = parsedData.Args || parsedData.args;
        let name = parsedData.Name || parsedData.name;
        if (this.txType == 1) {
          this.action = name.replace('v1', '');
          if (this.action == 'createName' || this.action == 'updateName') {
            this.address = args[0];
            args = args.slice(1);
            payload = "";
          }
          if (this.action === 'voteBP') {
            this.bps = parsedData.Args || parsedData.args;
            payload = "";
          }
        } else {
          this.action = (parsedData.Name || parsedData.name);
        }

        if (name === 'transferFrom') {
          this.action = name;
          this.address = args[0];
          args = args.slice(1);
        }

        if (args) {
          payload = "";
          this.args = args;
        }
      } catch(e) {
        payload = payloadBuffer.toString();
      }
      this.rest = payload;
    },
  },
  components: {
    ArgFormatter,
  }
};
</script>

<style lang="scss">
.list-payload {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  span:before {
    content: "· ";
  }
}
.args-payload {
  span:after {
    content: ", ";
  }
  span:last-child:after {
    content: "";
  }
}
.monospace.block {
  display: inline-block;
  margin-left: 1em;
}
.tx-action {
  font-weight: bold;
  margin-bottom: .5em;
}
.formatted-payload {
  display: flex;
  align-items: center;
  flex-direction: column;
  line-height: 1.5;
}
.formatted-payload a {
    border-color: #666;
}
</style>
