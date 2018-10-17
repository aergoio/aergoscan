<template>
  <div class="wrap">
    <div class="page-content">
      <div class="island">
        <div class="island-title">
          Account Details
        </div>
        <div class="island-content">
          <AccountBox :address="$route.params.address" />
          
          <div v-if="!accountDetail">Loading...</div>

          <table class="detail-table" v-if="accountDetail">
            <tr><td>Balance:</td><td v-html="$options.filters.formatToken(accountDetail.balance)"></td></tr>
           
            <tr v-if="accountDetail.codehash">
              <td nowrap>Contract code:</td>
              <td class="monospace">{{formattedCode}}</td>
            </tr>
            <tr v-if="contractAbi">
              <td nowrap>Contract ABI:</td>
              <td class="monospace code-highlight" v-html="formattedAbi"></td>
            </tr>
          </table>
          
          <!--Transactions: (Click to scan for transactions. This can take a while.)-->

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import aergo from '../../controller';
import moment from 'moment';
import { mapState } from 'vuex'
import AccountBox from '../components/AccountBox';

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
  data () {
    return {
      accountDetail: null,
      contractAbi: null
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
  components: {
    AccountBox,
  },
  computed: {
    formattedCode() {
      if (!this.accountDetail || !this.accountDetail.codehash) return '';
      const buf = Buffer.from(this.accountDetail.codehash);
      //return Buffer.from(this.accountDetail.codehash).toString();
      return Array.from(buf).map (b => b.toString (16).padStart (2, "0")).join (" ");
    },
    formattedAbi() {
      if (!this.contractAbi) return '';
      return syntaxHighlight(this.contractAbi);
    }
  },
  methods: {
    async load() {
      let address = this.$route.params.address;
      this.accountDetail = await this.$store.dispatch('blockchain/getAccount', { address });
      if (this.accountDetail.codehash) {
        this.contractAbi = await this.$store.dispatch('blockchain/getABI', { address });
        this.contractAbi.foo = true;
        this.contractAbi.bar = 3;
      }
    },
    moment
  },
};
</script>

<style lang="scss">
.code-highlight {
  background-color: #1E1E1E;
  padding: .75em;
  white-space: pre;
  line-height: 1.4;
  border-radius: 4px;

  font-weight: 500;
  color: #D4D4D4;

  .string, .boolean, .number, .null {
      font-weight: 500;
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
</style>