<script>
import AppHeader from './AppHeader.vue'

export default {
  components: { AppHeader },
}
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <div class="app-container__content">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-x: auto;

  &__content {
    flex: 1;
    padding: 24px 31px;
    min-height: 0px;
  }
}
</style>
