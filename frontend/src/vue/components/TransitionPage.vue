<template>
  <transition
    :name="transitionName"
    :mode="transitionMode"
    :enter-active-class="transitionEnterActiveClass"
    @beforeLeave="beforeLeave"
    @enter="enter"
    @afterEnter="afterEnter"
  >
    <slot/>
  </transition>
</template>

<script>
const DEFAULT_TRANSITION = `fade`;
const DEFAULT_TRANSITION_MODE = `out-in`;

export default {
  name: `TransitionPage`,
  data() {
    return {
      prevHeight: 0,
      transitionName: DEFAULT_TRANSITION,
      transitionMode: DEFAULT_TRANSITION_MODE,
      transitionEnterActiveClass: ``,
    };
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.transitionMode = DEFAULT_TRANSITION_MODE;
      let transitionName = from.meta.transitionName || to.meta.transitionName || DEFAULT_TRANSITION;

      this.transitionEnterActiveClass = `${transitionName}-enter-active`;

      this.transitionName = transitionName;
      next();
    });
  },
  methods: {
    beforeLeave(element) {
      //this.prevHeight = getComputedStyle(element).height;
    },
    enter(element) {
      //const { height } = getComputedStyle(element);
      // eslint-disable-next-line no-param-reassign
      //element.style.height = this.prevHeight;
      //setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
      //  element.style.height = height;
      //});
    },
    afterEnter(element) {
      // eslint-disable-next-line no-param-reassign
      //element.style.height = `auto`;
    },
  },
};
</script>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: height, opacity;
  transition-timing-function: ease;
  overflow: hidden;
}
.fade-enter,
.fade-leave-active {
  opacity: 0
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition-duration: 0.4s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}
.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(2em, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-2em, 0);
}

.slide-vertical-up-enter-active,
.slide-vertical-up-leave-active,
.slide-vertical-down-enter-active,
.slide-vertical-down-leave-active {
  transition-duration: .35s;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
  overflow: hidden;
}
.slide-vertical-up-enter-to,
.slide-vertical-down-enter-to {
  transform: translate(0, -100%);
}
.slide-vertical-up-enter{
  transform: translate(0, 0%);
}
.slide-vertical-down-leave-active {
  opacity: 0;
  transform: translate(0, 100%);
}
.slide-vertical-up-leave-active {
  opacity: 0;
  transform: translate(0, -100%);
}
.slide-vertical-down-enter {
  opacity: 0;
  transform: translate(0, -200%);
}

.zoom-enter-active,
.zoom-leave-active {
  animation-duration: 0.4s;
  animation-fill-mode: both;
  animation-name: zoom;
}
.zoom-leave-active {
  animation-direction: reverse;
}
@keyframes zoom {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  100% {
    opacity: 1;
  }
}
</style>