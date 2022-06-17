<script>
import LeftSide from './HeaderRow/LeftSide.vue'
import CenterSide from './HeaderRow/CenterSide.vue'
import RightSide from '@/components/Layout/Header/RightSide.vue'

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
    <RightSide class="right-side" />
  </div>
</template>

<style lang="scss" scoped>
.header-row {
  display: grid;
  grid-template-columns: min-content 1fr min-content;
}

.right-side {
  width: 270px;
  padding: 10px;
  padding-right: 30px;
  justify-content: flex-end;
  background-color: $color-dark;
  border-radius: 0px 0px 0px 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
