<script>
import LeftSide from '@/components/Outlay/LeftSide.vue'
import CenterWrapper from '@/components/Outlay/CenterWrapper.vue'
import RightSide from '@/components/Outlay/RightSide.vue'
import { mapMutations } from 'vuex'

export default {
  components: {
    LeftSide,
    CenterWrapper,
    RightSide,
  },
  mounted() {
    this.setOutlay({
      name: 'Test',
      rooms: [
        {
          id: '1650962280716',
          name: 'Комната',
          options: { width: 4, height: 3, length: 5, spaces: '2+3' },
          jobs: [],
        },
      ],
      info: {},
    })
  },
  methods: {
    ...mapMutations('outlay', ['setOutlay']),
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
