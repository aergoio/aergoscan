<template>
  <div id="footer">
    <div class="wrap">
      <div>
        &copy; 2018 <a id="logo" href="https://aergo.io"></a>
      </div>

      <div>
        <span class="network-selector-label">Network</span>
        <NetworkSelector />
      </div>
    </div>
  </div>
</template>

<script>
import NetworkSelector from './NetworkSelector';

export default {
  data () {
    return {
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
    openPopup() {
      chrome.tabs.create({url : "popup.html"});
    }
  },
  components: {
    NetworkSelector,
  }
};
</script>

<style lang="scss">
#footer {
  background-color: #E9E9E9;
  line-height: 23px;
  padding: 0 10px;
  font-size: (12/14)*1em;

  .wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  > :last-child {
    align-self: flex-end;
  }

  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 0;
}

#logo {
  display: inline-block;
  background: url('~@assets/img/logo.svg');
  width: 34px;
  height: 14px;
  background-size: auto 100%;
  background-repeat: no-repeat;
  vertical-align: text-bottom;
}

.network-selector-label {
  text-transform: uppercase;
  margin-right: 3px;

  &:after {
    content: ":";
  }
}
</style>