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
  </span>
</template>

<script>
import Identicon from './Identicon';
import bs58 from 'bs58';
import { Address } from '@herajs/client';

const actionLabels = {
  'aergo.name': {
    c: "create name",
    u: "update name",
  },
  'aergo.system': {
    s: "stake",
    u: "unstake",
    v: "vote"
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
      name: ""
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
        this.action = "function call";
        this.name = parsedData.Name;
        if (parsedData.Args) {
          const argsString = JSON.stringify(parsedData.Args);
          payload = argsString.substr(1, argsString.length-2);
        } else {
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
