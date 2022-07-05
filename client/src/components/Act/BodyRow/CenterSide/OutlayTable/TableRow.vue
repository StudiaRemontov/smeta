<script>
import { mapGetters, mapMutations } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'

import TableRowWrapper from '../CommonTable/TableRowWrapper.vue'
import TableRowData from '../CommonTable/TableRowData.vue'

export default {
  name: 'TableRow',
  components: { TableRowWrapper, TableRowData },
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
    ...mapGetters('acts', ['hoveredItem', 'selectedItem']),
    data() {
      return this.node.data
    },
    children() {
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    visibleKeys() {
      const keys = this.keys.map(k => {
        if (k.id === this.quantityKey.id) {
          return {
            ...k,
            name: 'Количество',
            id: 'quantity',
          }
        }
        return k
      })

      return keys
    },
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr))`,
      }
    },
    sum() {
      const quantity = this.node.data.quantity
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
  },
  methods: {
    ...mapMutations('acts', ['setHoveredItem']),
    mouseEnterHandler() {
      if (this.isCategory) {
        return
      }
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
    :style="headerStyle"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <TableRowData :data="data" :isCategory="isCategory" />
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
  display: grid;
  background-color: #fff;
  align-items: center;
  height: auto;

  &.category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
    height: 32px;
  }

  &:not(.category).striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }
}
</style>
