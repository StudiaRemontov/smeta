<script>
import { mapGetters } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'
import RowWrapper from './RowWrapper.vue'
import CellWrapper from './CellWrapper.vue'

export default {
  components: {
    RowWrapper,
    CellWrapper,
  },
  props: {
    node: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
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
      const quantity = this.node.data[this.quantityKey.id]
      const price = this.node.data[this.priceKey.id]
      return formatNumber(quantity * price)
    },
  },
}
</script>

<template>
  <RowWrapper>
    <CellWrapper v-for="key in keys" :key="key.id">
      {{ data[key.id] }}
    </CellWrapper>
    <CellWrapper right>
      {{ sum }}
    </CellWrapper>
  </RowWrapper>
</template>
