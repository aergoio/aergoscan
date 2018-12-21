<template>
  <div class="identicon">

  </div>
</template>

<script>
import jdenticon from "jdenticon";

export default {
  props: ['text', 'size'],
  data () {
    return {
    }
  },
  mounted () {
    this.$el.innerHTML = jdenticon.toSvg(this.$props.text, this.$props.size || 200);
  },
};
</script>

<style lang="scss">
.identicon {
  line-height: 1;
}
.mini-identicon {
  display: inline-block;
  border: 1px solid #ddd;
  vertical-align: middle;
}
.tiny-identicon {
  display: inline-block;
  vertical-align: middle;
}
</style>
