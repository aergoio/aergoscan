 <template>
  <span>
    <span v-if="!payload.length" class="label">(empty)</span>

    <span class="label label-action" v-if="action">{{action}}</span>
    <span class="monospace" v-if="name">{{name}}(</span>
    <span class="monospace">{{rest}}</span>
    <span class="monospace" v-if="name">)</span>
    <span v-if="address">
      <router-link :to="`/account/${address}/`">{{address}}</router-link>
    </span>
    <span class="list-payload" v-if="listPayload.length">
      <span v-for="item of listPayload" :key="item">
        {{item}}
      </span>
    </span>

    <span class="list-payload" v-if="bps.length">
      <span v-for="item of bps" :key="item">
        <router-link :to="`/votes/?highlight=${item}`">{{item}}</router-link>
      </span>
    </span>
  </span>
</template>

<script>
import Identicon from './Identicon';
import bs58 from 'bs58';
import { Address } from '@herajs/client';


export default {
  props: ['payload', 'txType', 'recipient'],
  data () {
    return {
      action: "",
      rest: "",
      listPayload: [],
      address: "",
      name: "",
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
      console.log(payload);
      try {
        let parsedData = JSON.parse(payload);
        if (this.txType == 1) {
          this.action = (parsedData.Name || parsedData.name).replace('v1', '');
        } else {
          this.action = "function call";
          this.name = (parsedData.Name || parsedData.name);
        }
        
        if (parsedData.Args || parsedData.args) {
          const argsString = JSON.stringify(parsedData.Args || parsedData.args);
          payload = argsString.substr(1, argsString.length-2);
        } else {
          payload = "";
        }

        if (this.action === 'voteBP') {
          this.bps = parsedData.Args || parsedData.args;
          payload = "";
        }
      } catch(e) {
      }
      this.rest = payload;
    },
  },
  components: {
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
</style>
