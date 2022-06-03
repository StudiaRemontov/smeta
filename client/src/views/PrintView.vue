<script>
import PrintPage from '@/components/Print/PrintPage.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: { PrintPage },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    ...mapGetters('outlay', ['outlay']),
    outlayId() {
      return this.$route.params.id
    },
  },
  watch: {
    outlayId: {
      handler() {
        if (this.outlay) {
          return
        }
        const outlay = this.outlays.find(o => o._id === this.outlayId)
        if (!outlay) return

        this.setOutlay(outlay)
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('outlay', ['setOutlay']),
  },
}
</script>

<template>
  <PrintPage v-if="outlay" :outlay="outlay" />
</template>
