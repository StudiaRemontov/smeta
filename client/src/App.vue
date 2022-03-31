<script>
import AppSidebar from '@/components/Layout/AppSidebar.vue'
import AppContainer from '@/components/Layout/AppContainer.vue'
import { mapActions } from 'vuex'

export default {
  components: { AppSidebar, AppContainer },
  async mounted() {
    await this.fetchAll()
  },
  methods: {
    ...mapActions('directory', ['fetchAll']),
  },
}
</script>

<template>
  <main class="main">
    <AppSidebar />
    <AppContainer />
  </main>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: min-content 1fr;
}
</style>
