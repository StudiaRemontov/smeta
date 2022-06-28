<script>
import CategoryRow from '../Print/Table/CategoryRow.vue'
import RowWrapper from '../Print/Table/RowWrapper.vue'
import CellWrapper from '../Print/Table/CellWrapper.vue'

import { getValuesInside } from '@/store/modules/outlay.module'
import { formatNumber } from '@/helpers/formatNumber'
import { mapGetters } from 'vuex'

export default {
  components: { CategoryRow, RowWrapper, CellWrapper },
  props: {
    tableKeys: {
      type: Array,
      required: true,
    },
    tableData: {
      type: Array,
      required: true,
    },
    room: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['quantityKey', 'priceKey']),
    sum() {
      const nodes = this.tableData.map(getValuesInside).flat()
      const total = nodes.reduce((acc, node) => {
        const { data } = node
        const sum = data.quantity * data[this.priceKey.id]
        acc += sum
        return acc
      }, 0)

      return formatNumber(total)
    },
  },
}
</script>

<template>
  <table class="print-table">
    <col
      v-for="(key, index) in tableKeys"
      :key="key.id"
      :width="index === 0 ? '50%' : '100px'"
    />
    <CategoryRow
      v-for="category in tableData"
      :key="category.key"
      :node="category"
    />
    <RowWrapper>
      <CellWrapper result :colspan="tableKeys.length">
        Итого по помещению ({{ room.name }})
      </CellWrapper>
      <CellWrapper result>{{ sum }}</CellWrapper>
    </RowWrapper>
  </table>
</template>

<style lang="scss" scoped>
.print-table {
  max-width: 100%;
  width: 100%;
  font-size: 12px;
  display: revert;
  border-spacing: 0px;
  margin-bottom: 20px;
  margin-top: 10px;
}

.table-cell {
  font-size: 12px;
  padding: 8px;

  &:not(:first-child) {
    text-align: center;
  }

  &--result {
    text-align: right !important;
    font-size: 13px;
    font-weight: 700;
  }
}
</style>

<style>
body {
  background-color: #fff;
  overflow: auto;
}
</style>
