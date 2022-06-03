<template>
  <div class="wrapper">
    <RouterView v-if="!loading" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      loading: true,
    }
  },

  async mounted() {
    try {
      await this.fetchAll()
    } catch (error) {
      console.log(error)
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions('outlays', ['fetchAll']),
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
