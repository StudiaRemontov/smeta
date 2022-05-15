<script>
import LeftSide from '@/components/Outlay/LeftSide.vue'
import CenterWrapper from '@/components/Outlay/CenterWrapper.vue'
import RightSide from '@/components/Outlay/RightSide.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    LeftSide,
    CenterWrapper,
    RightSide,
  },
  async mounted() {
    await this.fetchAll()
  },
  methods: {
    ...mapActions('outlays', ['fetchAll']),
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
