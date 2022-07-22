<script>
import AppLogo from '../../UI/AppLogo.vue'
import NavMenu from '../../UI/NavMenu.vue'

export default {
  components: { AppLogo, NavMenu },
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <AppLogo />
    </div>
    <div class="sidebar__body">
      <NavMenu />
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  background-color: $color-dark;
  width: 260px;

  &__header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 0 56px;
  }
}

.nav-menu {
  padding: 15px;
  background-color: $color-darker;
  color: $color-light;
}
</style>
