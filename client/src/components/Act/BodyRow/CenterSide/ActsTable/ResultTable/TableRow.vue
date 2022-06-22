<script>
import { mapGetters } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'

export default {
  name: 'TableRow',
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
    ...mapGetters('outlay', ['priceKey', 'striped']),
    data() {
      return this.node.data
    },
    children() {
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    sum() {
      const quantity = this.data.quantity || 0
      const price = this.data[this.priceKey.id]
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
  >
    <div class="table-cell">
      {{ data.quantity }}
    </div>
    <div class="table-cell">{{ sum }}</div>
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
  height: 32px;
  overflow: hidden;
  grid-template-columns: 1fr 1fr;

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

.table-cell {
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  font-weight: 700;
  @include act-table-cell;
}

.input {
  max-width: 100%;
  width: 100%;
  text-align: center;
}
</style>
