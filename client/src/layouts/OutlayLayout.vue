<script>
import { mapActions, mapGetters } from 'vuex'

import HeaderRow from '@/components/Outlay/HeaderRow.vue'
import BodyRow from '@/components/Outlay/BodyRow.vue'

export default {
  components: {
    HeaderRow,
    BodyRow,
  },
  data() {
    return {
      interval: null,
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
    ...mapGetters(['isOffline']),
  },
  async mounted() {
    await this.fetchAll()
    this.interval = setInterval(this.save, 1000 * 60)
  },
  unmounted() {
    clearInterval(this.interval)
  },
  methods: {
    ...mapActions('outlays', ['fetchAll']),
    ...mapActions('outlay', ['update', 'saveLocaly']),
    async save() {
      if (!this.isOffline) {
        await this.update()
        await this.saveLocaly()
      }
    },
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
