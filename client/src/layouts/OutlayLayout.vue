<script>
import { mapActions, mapGetters } from 'vuex'

import HeaderRow from '@/components/Outlay/HeaderRow.vue'
import BodyRow from '@/components/Outlay/BodyRow.vue'

export default {
  components: {
    HeaderRow,
    BodyRow,
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
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
    <HeaderRow />
    <BodyRow v-if="outlay" />
  </main>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-rows: 60px 1fr;
  gap: 15px;
  font-family: $outlay-font-family;
}
</style>
