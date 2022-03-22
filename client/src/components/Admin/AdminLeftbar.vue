<script>
import NavMenu from '@/components/Admin/Leftbar/NavMenu.vue'

export default {
  components: { NavMenu },
}
</script>

<template>
  <div class="admin-left-bar">
    <div class="admin-left-bar__header">
      <span class="admin-left-bar__title"> Админ панель </span>
    </div>
    <NavMenu />
  </div>
</template>

<style lang="scss" scoped>
.admin-left-bar {
  padding: 10px;
  box-shadow: $shadow-dark;

  &__header {
    margin-bottom: 30px;
  }

  &__title {
    font-size: $font-medium;
  }
}
</style>
