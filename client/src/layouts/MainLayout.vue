<script>
import AppSidebar from '@/components/Layout/App/AppSidebar.vue'
import AppContainer from '@/components/Layout/App/AppContainer.vue'

export default {
  components: { AppSidebar, AppContainer },
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
