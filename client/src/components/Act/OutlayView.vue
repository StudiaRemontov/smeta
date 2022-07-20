<script>
import TreeTableView from '@/components/Outlay/BodyRow/CenterSide/TreeTableView/TreeTableView.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    TreeTableView,
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
  },
}
</script>

<template>
  <div class="outlay-view">
    <span class="outlay-view__title">Смета: {{ outlay.name }}</span>
    <TreeTableView />
  </div>
</template>

<style lang="scss" scoped>
.outlay-view {
  display: flex;
  flex-direction: column;
  min-height: 0px;

  &__title {
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
