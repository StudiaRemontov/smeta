<script>
import CenterSide from './BodyRow/CenterSide.vue'
import RightSide from './BodyRow/RightSide.vue'
import LeftSide from './BodyRow/LeftSide.vue'

export default {
  components: {
    LeftSide,
    CenterSide,
    RightSide,
  },
}
</script>

<template>
  <div class="body-row">
    <div class="left-side">
      <LeftSide />
    </div>
    <CenterSide />
    <div class="right-side">
      <RightSide />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body-row {
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  padding-bottom: 17px;
  min-height: 0px;
}

.left-side,
.right-side {
  width: 270px;
  padding: 0px 15px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-height: 0px;
}

.center {
  background-color: $color-light;
  border-radius: 10px;

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0px;
  }
}

// .print {
//   position: fixed;
//   top: 50%;
//   left: 50%;
//   width: 800px;
//   height: 600px;
//   box-shadow: 0px 0px 4px black;
// }
</style>
