<script>
import { mapActions, mapGetters } from 'vuex'

import HeaderRow from '@/components/Act/HeaderRow.vue'
import BodyRow from '@/components/Act/BodyRow.vue'

export default {
  components: {
    HeaderRow,
    BodyRow,
  },
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    ...mapGetters('acts', ['act']),
    id() {
      return this.$route.params.id
    },
  },
  async mounted() {
    if (!this.id) {
      return
    }
    try {
      await this.fetchAll()
      const outlay = this.outlays.find(o => o._id === this.id)
      if (!outlay) {
        return
      }
      await this.prepateOutlay(outlay)
      this.setOutlay(outlay)
    } catch (error) {
      console.log(error)
    } finally {
      this.loading = false
    }
  },
  unmounted() {
    this.setOutlay(null)
  },
  methods: {
    ...mapActions('acts', ['fetchAll', 'setOutlay']),
    ...mapActions('outlay', {
      prepateOutlay: 'setOutlay',
    }),
  },
}
</script>

<template>
  <main class="main">
    <HeaderRow />
    <BodyRow v-if="act && !loading" />
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
