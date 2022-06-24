<script>
import { mapGetters } from 'vuex'
import OutlayItem from './OutlayItem.vue'

export default {
  components: {
    OutlayItem,
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    reversedOutlays() {
      return [...this.outlays]
    },
  },
}
</script>

<template>
  <ul v-if="reversedOutlays && reversedOutlays.length > 0" class="outlay-list">
    <OutlayItem
      v-for="outlay in reversedOutlays"
      :key="outlay._id"
      :outlay="outlay"
    />
  </ul>
</template>

<style lang="scss" scoped>
.outlay-list {
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 130px;
  gap: 20px;
}
</style>
