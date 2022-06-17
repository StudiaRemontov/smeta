import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('outlay', ['keys']),
    rowStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `1fr repeat(${keysLength}, 100px)`,
      }
    },
  },
}
