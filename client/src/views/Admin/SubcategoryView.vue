<template>
  <div class="admin-subpage">
    <div class="admin-subpage__header">
      <span class="page-title">Подкатегории</span>
    </div>
    <div class="admin-subpage__body">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-subpage {
  max-height: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &__header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px #ccc solid;
  }

  &__body {
    flex: 1;
  }
}
</style>
