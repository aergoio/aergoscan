 <template>
  <span>
    <span class="label label-action" v-if="action">{{action}}</span>
    <span class="monospace">{{rest}}</span>
  </span>
</template>

<script>
import Identicon from './Identicon';

const actionLabels = {
  c: "create name",
  u: "update name",
  s: "stake",
  u: "unstake",
  v: "vote"
};

export default {
  props: ['payload', 'txType'],
  data () {
    return {
      action: "",
      rest: ""
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
      let payload = Buffer.from(this.payload).toString();
      if (this.txType === 1) {
        const action = payload[0];
        payload = payload.substr(1);
        if (typeof actionLabels[action] !== 'undefined') {
          this.action = actionLabels[action];
        } else {
          this.action = action;
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

</style>
