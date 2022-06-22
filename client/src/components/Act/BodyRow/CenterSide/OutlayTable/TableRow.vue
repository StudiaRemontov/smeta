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
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey', 'striped']),
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
    :style="headerStyle"
  >
    <div v-for="key in visibleKeys" :key="key.id" class="table-cell">
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
  @include table-cell;
}
</style>
