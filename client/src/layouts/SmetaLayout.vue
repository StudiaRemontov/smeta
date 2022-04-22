<script>
import LeftSide from '@/components/Smeta/LeftSide.vue'
import CenterWrapper from '@/components/Smeta/CenterWrapper.vue'
import RightSide from '@/components/Smeta/RightSide.vue'

export default {
  components: {
    LeftSide,
    CenterWrapper,
    RightSide,
  },
}
</script>

<template>
  <main class="main">
    <LeftSide />
    <CenterWrapper />
    <RightSide />
  </main>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: min-content 1fr min-content;
}
</style>
