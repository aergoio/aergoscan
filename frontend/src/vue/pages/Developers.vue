<template>
  <div class="wrap">
    <div class="page-content">
      <div class="side-by-side">
        <div class="island">
          <div class="island-title">
            AERGO Pre-testnet guide
          </div>
          <div class="island-content">
            
            <p>The AERGO developer portal is currently under construction.</p>
            <p>To get started, please refer to the following guides.</p>
            <ul>
              <li><a href="">Running a local node</a></li>
              <li>Development using <a href="">heraj</a> and <a href="">herajs</a></li>
            </ul>
            <p>Also, refer to these ressources:</p>
            <ul>
              <li><a href="">Twitter</a></li>
              <li><a href="">Medium</a></li>
              <li><a href="">Github</a></li>
            </ul>
          </div>
        </div>

        <div class="island">
          <div class="island-title">
            Developer registration
          </div>
          <div class="island-content">
            
            <p>You can sign up here if you want to get in touch with us.</p>
            <p>Please send us an email to <a href="mailto:pretestnet@aergo.io">pretestnet@aergo.io</a> with the following information:</p>
            <ul>
              <li>Your name</li>
              <li>Your company, occupation, or project</li>
              <li>Your use case for the testnet</li>
            </ul>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      txDetail: null
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
  },
};
</script>

<style lang="scss">
</style>