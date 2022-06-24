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
      loading: true,
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
    ...mapGetters(['isOffline']),
  },
  watch: {
    isOffline(value) {
      if (!value) {
        this.syncData()
      }
    },
  },
  async mounted() {
    this.loading = true
    await this.setOutlay(null)
    this.interval = setInterval(this.save, 1000 * 60)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.interval)
    this.setOutlay(null)
  },
  methods: {
    ...mapActions('outlays', ['fetchAll', 'uploadFromServer']),
    ...mapActions('outlay', ['update', 'saveLocaly', 'setOutlay']),
    async save() {
      if (!this.isOffline) {
        await this.update()
        await this.saveLocaly()
      }
    },
    async syncData() {
      try {
        await this.uploadFromServer()
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <main class="main">
    <HeaderRow />
    <BodyRow v-if="outlay && !loading" />
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
