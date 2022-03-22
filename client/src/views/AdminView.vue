<script>
import AdminLeftbar from '@/components/Admin/AdminLeftbar.vue'

export default {
  components: { AdminLeftbar },
}
</script>

<template>
  <div class="admin-view">
    <AdminLeftbar />
    <div class="admin-view__content">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-view {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: grid;
  grid-template-columns: 200px 1fr;

  &__content {
    height: 100%;
    overflow-y: auto;
    padding: 10px;
  }
}
</style>
