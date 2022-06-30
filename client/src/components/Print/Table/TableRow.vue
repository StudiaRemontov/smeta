<script>
import { mapGetters } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'
import RowWrapper from './RowWrapper.vue'
import CellWrapper from './CellWrapper.vue'

export default {
  name: 'TableRow',
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
  },
}
</script>

<template>
  <RowWrapper :bold="isCategory">
    <CellWrapper v-for="item in viewData" :key="item.key">
      {{ item.value }}
    </CellWrapper>
    <CellWrapper right>
      <span v-if="!isCategory" class="sum-cell">
        {{ sum }}
      </span>
    </CellWrapper>
  </RowWrapper>
  <template v-if="isCategory">
    <TableRow v-for="row in children" :key="row.key" :node="row" />
  </template>
</template>

<style lang="scss" scoped>
.sum-cell {
  font-size: inherit;
}
</style>
