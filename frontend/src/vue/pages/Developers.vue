<template>
  <div class="wrap">
    <div class="page-content">
      <div class="side-by-side">
        <Island>
          <IslandHeader title="Welcome to Aergoscan" /> 
          <div v-if="deployment==='mainnet'">
            <p>Aergoscan is showing the status of the mainnet. This is the public Aergo main blockchain.</p>
            <p>You can use this website to view blocks as they get created, transactions and accounts (including contracts).</p>
            <p>Please use the <a href="https://testnet.aergoscan.io">testnet</a> for testing purposes.</p>
          </div>
          <div v-if="deployment!=='mainnet'">
            <p>Aergoscan is showing the status of the testnet.</p>
            <p>This is a deployment of the Aergo main blockchain for testing purposes.</p>
            <p>You can use this website to view blocks as they get created, transactions and accounts (including contracts).</p>
          </div>
        </Island>

        <Island>
          <IslandHeader title="Developer registration" />
          <p>If you want to receive updates regarding Aergo and using the network, please register here.</p>
          <a href="https://my.sendinblue.com/users/subscribe/js_id/3l4b4/id/3" class="btn primary" target="_blank">Register</a>
        </Island>

      </div>

      <div class="side-by-side">
        <Island>
          <IslandHeader title="References" />
          <p>To get started, please refer to our <a href="http://docs.aergo.io/">Official Guide</a>.</p>
          <p>Also, check out these ressources:</p>
          <ul>
            <li><a href="https://discord.gg/YuPCCeH">Discord</a></li>
            <li><a href="https://twitter.com/aergo_IO">Twitter</a></li>
            <li><a href="https://medium.com/aergo">Medium</a></li>
            <li><a href="https://github.com/aergoio">Github</a></li>
          </ul>
        </Island>

        <Island>
          <IslandHeader title="Explore" />
          <p>Stay tuned for a showcase of what's possible with Aergo.</p>
        </Island>
      </div>
    </div>
  </div>
</template>

<script>
import { Island, IslandHeader } from "aergo-ui/src/components/layout";

export default {
  data () {
    return {
    }
  },
  components: {
    Island, IslandHeader,
  },
  computed: {
    deployment() {
      return process.env.DEPLOYMENT;
    }
  }
};
</script>

<style lang="scss">
</style>