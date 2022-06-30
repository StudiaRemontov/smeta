<script>
import { formatNumber } from '@/helpers/formatNumber'
import { mapGetters } from 'vuex'

export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    isCategory: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
    sum() {
      const quantity = this.data.quantity
      const price = this.data[this.priceKey.id]
      return formatNumber(quantity * price)
    },
    rowData() {
      const formattedKeys = [this.quantityKey.id, this.priceKey.id, 'quantity']
      return this.keys.map(key => {
        if (formattedKeys.includes(key.id)) {
          const value =
            key.id === this.quantityKey.id
              ? this.data.quantity
              : this.data[key.id]
          return {
            key: key.id,
            value: formatNumber(value),
          }
        }
        return {
          key: key.id,
          value: this.data[key.id],
        }
      })
    },
  },
}
</script>

<template>
  <template v-for="(row, index) in rowData" :key="row.key">
    <div
      v-if="index === 0"
      v-tooltip.top="row.value"
      class="table-cell"
      :class="{ quantity: row.key === quantityKey.id }"
    >
      {{ row.value }}
    </div>
    <div
      v-else
      class="table-cell"
      :title="row.value"
      :class="{ quantity: row.key === quantityKey.id }"
    >
      {{ row.value }}
    </div>
  </template>
  <div v-if="!isCategory" class="table-cell">
    {{ sum }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  white-space: nowrap;
  @include table-cell;

  &.quantity {
    font-weight: 700;
  }
}
</style>
