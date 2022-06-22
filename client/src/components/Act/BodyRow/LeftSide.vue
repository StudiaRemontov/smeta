<script>
import ActionList from './LeftSide/ActionList.vue'
import TabList from './LeftSide/TabList.vue'

export default {
  components: {
    ActionList,
    TabList,
  },
}
</script>

<template>
  <div class="wrapper">
    <ActionList />
    <TabList />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
</style>
