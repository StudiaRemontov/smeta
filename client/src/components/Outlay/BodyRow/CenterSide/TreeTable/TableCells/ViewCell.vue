<script>
import { mapGetters } from 'vuex'

import { formatNumber } from '@/helpers/formatNumber'

export default {
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
    :class="{ danger: !isValidQuantity }"
    :title="viewValue"
  >
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
