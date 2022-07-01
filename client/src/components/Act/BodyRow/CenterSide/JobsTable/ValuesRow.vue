<script>
import TableRowWrapper from './TableRowWrapper.vue'
import TableCellWrapper from './TableCellWrapper.vue'

export default {
  components: { TableRowWrapper, TableCellWrapper },
  inject: ['keys', 'pushNodes', 'removeNodes', 'selectedNodes'],
  props: {
    node: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  emits: ['checked'],
  computed: {
    selected() {
      return this.selectedNodes[this.node.key]
    },
  },
  methods: {
    clickNode() {
      this.$emit('checked')
    },
  },
}
</script>

<template>
  <TableRowWrapper class="values-row" :class="{ selected }" @click="clickNode">
    <TableCellWrapper v-for="key in keys" :key="key.id">
      {{ node.data[key.id] }}
    </TableCellWrapper>
  </TableRowWrapper>
</template>

<style lang="scss" scoped>
.values-row {
  &:hover {
    background: rgb(233, 233, 233);
  }
  &.selected:hover {
    background: #d1eeb4;
  }
  &.selected {
    background: #e0ffc0;
  }
}
</style>
