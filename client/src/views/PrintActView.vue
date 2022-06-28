<script>
import PrintPage from '@/components/PrintAct/PrintPage.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  components: { PrintPage },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    ...mapGetters('acts', ['act']),
    ...mapState('acts', ['acts']),
    actId() {
      return this.$route.params.id
    },
  },
  watch: {
    actId: {
      handler() {
        if (this.act) {
          return
        }
        this.setData()
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('outlay', {
      prepareOutlay: 'setOutlay',
    }),
    ...mapActions('acts', ['setOutlay', 'setAct']),
    async setData() {
      const act = this.acts.find(a => a._id === this.actId)
      if (!act) {
        return
      }
      const { outlay: actOutlay } = act
      const outlay = this.outlays.find(o => o._id === actOutlay)
      await this.prepareOutlay(outlay)
      await this.setOutlay(outlay)
      await this.setAct(act)
    },
  },
}
</script>

<template>
  <PrintPage v-if="act" :act="act" />
</template>
