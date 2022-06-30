<script>
import { mapGetters, mapMutations } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'
import actsTable from '@/mixins/actsTable.mixin'

import TableRowWrapper from '../CommonTable/TableRowWrapper.vue'
import TableRowData from '../CommonTable/TableRowData.vue'

export default {
  name: 'TableRow',
  components: { TableRowWrapper, TableRowData },
  mixins: [actsTable],
  props: {
    node: {
      type: Object,
      required: true,
      default: () => {},
    },
    level: Number,
    room: String,
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey', 'striped']),
    ...mapGetters('acts', [
      'showOnlyCompleted',
      'completedValues',
      'hoveredItem',
      'selectedItem',
      'showLeftQuantity',
    ]),
    data() {
      return this.node.data
    },
    children() {
      if (this.showOnlyCompleted) {
        return this.node.children.filter(n =>
          this.completedValues.includes(n.key),
        )
      }
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    sum() {
      const quantity = this.node.data[this.quantityKey.id]
      const price = this.node.data[this.priceKey.id]
      return formatNumber(quantity * price)
    },
    hovered() {
      if (!this.hoveredItem) {
        return false
      }
      return (
        this.node.key === this.hoveredItem.id &&
        this.room === this.hoveredItem.room
      )
    },
    selected() {
      if (!this.selectedItem) {
        return false
      }
      return (
        this.node.key === this.selectedItem.id &&
        this.room === this.selectedItem.room
      )
    },
    rowData() {
      const cloneData = JSON.parse(JSON.stringify(this.data))
      if (this.showLeftQuantity) {
        const diff = cloneData[this.quantityKey.id] - cloneData.quantity
        const quantity = diff < 0 ? 0 : diff
        cloneData.quantity = quantity
        return cloneData
      }
      cloneData.quantity = cloneData[this.quantityKey.id]
      return cloneData
    },
  },
  methods: {
    ...mapMutations('acts', ['setHoveredItem']),
    mouseEnterHandler() {
      this.setHoveredItem({ id: this.node.key, room: this.room })
    },
    mouseLeaveHandler() {
      this.setHoveredItem(null)
    },
  },
}
</script>

<template>
  <TableRowWrapper
    class="table-row"
    :class="{ category: isCategory, striped, hovered, selected }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    :style="rowStyle"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <TableRowData :data="rowData" :isCategory="isCategory" />
  </TableRowWrapper>
  <template v-if="isCategory">
    <TableRow
      v-for="child in children"
      :key="child.key"
      :node="child"
      :room="room"
      :level="level + 1"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  &.category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
    height: 32px;
  }

  &:not(.category).striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }

  &:first-of-type {
    position: sticky;
    left: 0;
  }
}

.table-cell {
  white-space: nowrap;
  text-overflow: ellipsis;
  @include table-cell;
}
</style>
