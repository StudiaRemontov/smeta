<template>
  <div class="wrapper">
    <RouterView v-if="contentLoaded" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('acts', {
      actsLoaded: 'contentLoaded',
    }),
    ...mapState('outlays', {
      outlaysLoaded: 'contentLoaded',
    }),
    contentLoaded() {
      return this.actsLoaded && this.outlaysLoaded
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  overflow: auto;
}

@media print {
  .wrapper {
    overflow: hidden;
    height: unset;
  }
}
</style>

<style>
@media print {
  body {
    overflow: auto !important;
  }
}
</style>
