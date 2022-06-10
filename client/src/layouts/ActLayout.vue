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
    ...mapGetters('outlays', ['outlays']),
    ...mapGetters('outlay', ['outlay']),
    id() {
      return this.$route.params.id
    },
  },
  async mounted() {
    if (!this.id) {
      return
    }

    const outlay = this.outlays.find(o => o._id === this.id)
    if (!outlay) {
      return
    }
    await this.setOutlay(outlay)
  },
  methods: {
    ...mapActions('outlay', ['setOutlay']),
    ...mapActions('outlays', ['fetchAll']),
  },
}
</script>

<template>
  <main class="main">
    <HeaderRow />
    <BodyRow v-if="outlay" />
  </main>
  <div id="print" class="print"></div>
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

.print {
  display: none;
}

@media print {
  .main {
    display: none;
  }

  .print {
    display: block;
  }
}
</style>
