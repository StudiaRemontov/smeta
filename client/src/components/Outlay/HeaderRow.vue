<script>
import LeftSide from './HeaderRow/LeftSide.vue'
import CenterSide from './HeaderRow/CenterSide.vue'
import RightSide from './HeaderRow/RightSide.vue'

export default {
  components: {
    LeftSide,
    CenterSide,
    RightSide,
  },
}
</script>

<template>
  <div class="header-row">
    <LeftSide />
    <CenterSide />
    <RightSide />
  </div>
</template>

<style lang="scss" scoped>
.header-row {
  display: grid;
  grid-template-columns: min-content 1fr min-content;
}
</style>
