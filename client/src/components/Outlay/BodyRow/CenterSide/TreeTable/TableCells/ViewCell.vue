<script>
import { formatNumber } from '@/helpers/formatNumber'
import { mapGetters } from 'vuex'
export default {
  inject: ['changed'],
  props: {
    value: {
      required: true,
    },
    isClone: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    index: Number,
    keyData: {
      type: Object,
      default: () => ({}),
    },
    isSum: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('outlay', ['quantityKey', 'priceKey']),
    isValidQuantity() {
      if (this.keyData.id === this.quantityKey.id) {
        return this.value > 0
      }
      return true
    },
    viewValue() {
      const formattedKeys = [this.quantityKey.id, this.priceKey.id]
      if (this.isSum || formattedKeys.includes(this.keyData.id)) {
        return formatNumber(this.value)
      }
      return this.value
    },
  },
}
</script>

<template>
  <div
    class="table-cell"
    :class="{ danger: !isValidQuantity && isClone && selected }"
    :title="value"
    :data-cellIndex="index"
  >
    <span v-if="index === 0 && changed"> * </span>
    {{ viewValue }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &.danger {
    color: #ff3737;
    font-weight: 600;
    border-bottom: #ff3737 1px solid;
  }
}
</style>
