<script>
import TableRowWrapper from './TableRowWrapper.vue'
import QuantityCell from './QuantityCell.vue'
import TableCellWrapper from './TableCellWrapper.vue'
import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: { TableRowWrapper, QuantityCell, TableCellWrapper },
  mixins: [keyTypes],
  inject: ['keys', 'selectedNodes', 'updateNode'],
  props: {
    node: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  emits: ['checked'],
  data() {
    return {
      timeout: null,
    }
  },
  computed: {
    selected() {
      return this.selectedNodes[this.node.key]
    },
    data() {
      return this.node.data
    },
  },
  methods: {
    clickNode() {
      this.$emit('checked')
    },
    updateHandler() {
      if (this.timeout) {
        this.timeout = clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.updateNode(this.node)
      }, 300)
    },
  },
}
</script>

<template>
  <TableRowWrapper class="values-row" :class="{ selected }" @click="clickNode">
    <template v-for="key in keys" :key="key.id">
      <QuantityCell
        v-if="key.type === InputType.QUANTITY"
        v-model="data[key.id]"
        @update:modelValue="updateHandler"
      />
      <TableCellWrapper v-else>
        {{ data[key.id] }}
      </TableCellWrapper>
    </template>
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
