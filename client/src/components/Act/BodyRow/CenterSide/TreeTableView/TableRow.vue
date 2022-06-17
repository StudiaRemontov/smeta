<script>
import { mapGetters } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'
import actsTable from '@/mixins/actsTable.mixin'

export default {
  name: 'TableRow',
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
    ...mapGetters('acts', ['showOnlyCompleted', 'completedValues']),
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
  },
}
</script>

<template>
  <div
    class="table-row"
    :class="{ category: isCategory, striped }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    :style="rowStyle"
  >
    <div
      v-for="key in keys"
      :key="key.id"
      class="table-cell"
      :title="data[key.id]"
    >
      {{ data[key.id] }}
    </div>
    <div v-if="!isCategory" class="table-cell">
      {{ sum }}
    </div>
  </div>
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
  overflow: hidden;
  height: 32px;

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
