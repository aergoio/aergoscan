<template>
  <div class="btn" v-bind:class="{primary, loading}">
    {{text}}
  </div>
</template>

<script>
export default {
  name: 'Button',
  props: ['text', 'primary', 'loading'],
  data () {
    return {
    }
  },
};
</script>

<style lang="scss">
.btn, a.btn {
  display: inline-block;
  border: 1px solid #aaa;
  line-height: 22px;
  border-radius: 100px;
  font-weight: 500;
  font-size: (11/12)*1em;
  text-align: center;
  padding: 0 5em;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: #FF36AD 0 0 6px
  }

  &.primary {
    background-color: #FF36AD;
    border-color: #FF36AD;
    color: #FFFFFF;
  }

  &.secondary {
    background-color: transparent;
    border-color: transparent;
    color: #999;
  }
}

.btn + .btn {
  margin-top: 5px;
}
</style>
