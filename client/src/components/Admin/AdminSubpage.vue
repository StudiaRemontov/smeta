<script>
export default {
  computed: {
    pageTitle() {
      return this.$route.meta.title
    },
  },
}
</script>

<template>
  <div class="admin-subpage">
    <div class="admin-subpage__header">
      <span class="page-title">{{ pageTitle }}</span>
    </div>
    <div class="admin-subpage__content">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-subpage {
  padding: 10px;
  max-height: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px #ccc solid;
  }

  &__content {
    padding-top: 10px;
    height: 100%;
    overflow-y: auto;
  }
}
</style>
