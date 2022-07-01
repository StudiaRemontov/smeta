<script>
import TableRowWrapper from './TableRowWrapper.vue'
import TableCellWrapper from './TableCellWrapper.vue'

export default {
  components: {
    TableRowWrapper,
    TableCellWrapper,
  },
  inject: ['keys'],
  props: {
    name: {
      type: String,
      required: true,
    },
    showKeys: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    viewData() {
      const firstKey = {
        ...this.keys[0],
        name: this.name,
      }
      const keys = this.showKeys ? this.keys : [firstKey]

      return keys.map((key, index) => {
        if (index === 0) {
          return firstKey
        }
        return key
      })
    },
  },
}
</script>

<template>
  <TableRowWrapper>
    <TableCellWrapper v-for="key in viewData" :key="key.id">
      {{ key.name }}
    </TableCellWrapper>
  </TableRowWrapper>
</template>
