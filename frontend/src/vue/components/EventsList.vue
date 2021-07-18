<template>
  <div class="aergo-tab-content monospace"><pre>{{JSON.stringify(eventsJson, null, 2)}}</pre></div>
</template>

<script>

export default {
  props: ['address', 'blockno'],
  data () {
    return {
      eventsJson: {},
    }
  },
  components: {
  },
  mounted () {
    this.loadEvents();
  },
  methods: {
    async loadEvents() {
      this.eventsJson = await this.$store.dispatch('blockchain/getEvents', {
        address: this.address,
        blockfrom: this.blockno,
        blockto: this.blockno,
      });
    },
  }
};
</script>

<style lang="scss">
</style>
