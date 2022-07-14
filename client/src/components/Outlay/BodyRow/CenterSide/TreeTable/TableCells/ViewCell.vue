<script>
import { mapGetters } from 'vuex'

import { formatNumber } from '@/helpers/formatNumber'

export default {
  inject: ['changed'],
  props: {
    value: {
      required: true,
    },
    keyData: {
      type: Object,
    },
    isSum: {
      type: Boolean,
      default: false,
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
  },
  computed: {
    ...mapGetters('outlay', ['priceKey', 'quantityKey']),
    viewValue() {
      if (
        this.keyData?.id === this.priceKey.id ||
        this.keyData?.id === this.quantityKey.id ||
        this.isSum
      ) {
        return formatNumber(this.value)
      }

      return this.value
    },
    isValidQuantity() {
      if (this.keyData?.id !== this.quantityKey.id) {
        return true
      }

      return this.value > 0
    },
  },
}
</script>

<template>
  <div
    class="table-cell"
    :class="{ danger: !isValidQuantity && isClone && selected }"
    :title="viewValue"
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
