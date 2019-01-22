 <template>
  <span>
    <span class="label label-action" v-if="action">{{action}}</span>
    <span class="monospace">{{rest}}</span>
    <span v-if="address">
      <router-link :to="`/account/${address}/`">{{address}}}</router-link>
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
  'aergo.update': {
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
      if (this.txType === 1) {
        const action = payload[0];
        payload = payload.substr(1);
        payloadBuffer = payloadBuffer.slice(1);
        if (typeof actionLabels[this.recipient][action] !== 'undefined') {
          this.action = actionLabels[this.recipient][action];
        } else {
          this.action = action;
        }
        if (action === 'v') { // decode vote peer ids
          const peerids = [];
          while (payloadBuffer.length >= 39) {
            peerids.push(payloadBuffer.slice(0, 39));
            payloadBuffer = payloadBuffer.slice(39);
          }
          this.listPayload = peerids.map(id => bs58.encode(id));
          payload = ''
        }
        if (this.recipient.toString() === 'aergo.name' && action === 'u') { // decode update name
          const name = payload.substr(0, 12);
          this.address = Address.encode(payloadBuffer.slice(13));
          payload = `${name}`;
        }
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
