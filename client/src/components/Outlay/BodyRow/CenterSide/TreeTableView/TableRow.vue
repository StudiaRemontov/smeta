<script>
import { mapGetters } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'

export default {
  name: 'TableRow',
  inject: ['opacities'],
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
    opacity() {
      return this.opacities[this.level - 1] || 0
    },
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr))`,
      }
    },
    sum() {
      const quantity = this.node.data[this.quantityKey.id]
      const price = this.node.data[this.priceKey.id]
      const { coef } = this.node
      return formatNumber(quantity * (price * coef))
    },
    viewData() {
      if (this.isCategory) {
        return [
          {
            key: this.keys[0].id,
            value: this.data[this.keys[0].id],
          },
        ]
      }
      const formattedKeys = [this.quantityKey.id, this.priceKey.id, 'quantity']
      return this.keys.map(k => {
        if (formattedKeys.includes(k.id)) {
          const value = formatNumber(this.data[k.id])
          if (k.id === this.priceKey.id) {
            const { coef } = this.node
            const priceValue =
              coef > 1 ? `${value} (${formatNumber(coef)})` : value
            return {
              key: k.id,
              value: priceValue,
            }
          }
          return {
            key: k.id,
            value,
          }
        }
        return {
          key: k.id,
          value: this.data[k.id],
        }
      })
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
    <div v-for="item in viewData" :key="item.key" class="table-cell">
      {{ item.value }}
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
    position: sticky;
    top: calc(32px * v-bind(level));
    font-weight: 600;
    height: 32px;
    text-align: center;
  }

  &:not(.category).striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }
}

.table-cell {
  @include table-cell;
}
</style>
