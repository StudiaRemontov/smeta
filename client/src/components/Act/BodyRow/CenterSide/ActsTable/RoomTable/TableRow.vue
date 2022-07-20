<script>
import { mapGetters, mapMutations } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'
import actsTable from '@/mixins/actsTable.mixin'

import TableRowWrapper from '../../CommonTable/TableRowWrapper.vue'

export default {
  name: 'TableRow',
  components: {
    TableRowWrapper,
  },
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
    left() {
      const outlayQuantity = this.node.data[this.quantityKey.id]
      const actQuantity = this.node.data.quantity
      const diff = outlayQuantity - actQuantity
      const value = diff < 0 ? 0 : diff
      return formatNumber(value)
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
    viewData() {
      const formattedKeys = [this.quantityKey.id, this.priceKey.id, 'quantity']
      return this.keys.map(k => {
        if (formattedKeys.includes(k.id)) {
          return {
            key: k.id,
            value: formatNumber(this.data[k.id]),
          }
        }
        return {
          key: k.id,
          value: this.data[k.id],
        }
      })
    },
    added() {
      return this.node.added
    },
    overWorked() {
      return this.data[this.quantityKey.id] < this.data.quantity
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
    :class="{
      category: isCategory,
      striped,
      hovered,
      selected,
      oranged: added || overWorked,
    }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    :style="rowStyle"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <template v-if="isCategory">
      <div class="table-cell">
        {{ viewData[0].value }}
      </div>
    </template>
    <template v-else v-for="(item, index) in viewData" :key="item.key">
      <div
        v-if="index === 0"
        v-tooltip.top="item.value"
        class="table-cell"
        :class="{ quantity: item.key === quantityKey.id }"
      >
        {{ item.value }}
      </div>
      <div
        v-else
        class="table-cell"
        :class="{ quantity: item.key === quantityKey.id }"
        :title="item.value"
      >
        {{ item.value }}
      </div>
    </template>
    <div v-if="!isCategory" class="table-cell">
      {{ left }}
    </div>
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
    font-weight: 600;
    text-align: center;
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

  &.quantity {
    font-weight: 700;
  }
}
</style>
