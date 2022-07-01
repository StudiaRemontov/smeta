<script>
import TableGroup from './TableGroup.vue'

export default {
  components: {
    TableGroup,
  },
  inject: ['keys'],
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <div class="jobs-table">
    <div class="table-grid" ref="wrapper">
      <TableGroup
        v-for="node in data"
        :key="node.key"
        :node="node"
        :level="0"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.jobs-table {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  position: relative;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
  @include darkScroll;
  overflow-y: overlay;
}

.table-grid {
  flex: 1;
  min-width: fit-content;
  position: relative;
}
</style>
