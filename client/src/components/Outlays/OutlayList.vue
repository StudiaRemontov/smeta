<script>
import OutlayItem from './OutlayItem.vue'

export default {
  components: {
    OutlayItem,
  },
  props: {
    items: {
      type: Array,
    },
  },
  data() {
    return {
      formVisible: false,
    }
  },
}
</script>

<template>
  <ul class="outlay-list">
    <OutlayItem />
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
