<script>
import TableRow from './SubcategoryTable/TableRow.vue'

export default {
  components: { TableRow },
  props: {
    data: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      keys: ['Название', 'Список работ', 'Действия'],
    }
  },
}
</script>

<template>
  <table class="subcategory-table">
    <tr class="subcategory-table__row">
      <th class="table-cell table-cell--head">#</th>
      <th v-for="key in keys" :key="key" class="table-cell table-cell--head">
        {{ key }}
      </th>
    </tr>
    <TableRow
      v-for="(row, index) in data"
      :key="row.id"
      :rowData="row"
      :rowIndex="index"
    />
  </table>
</template>

<style lang="scss" scoped>
.subcategory-table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
}
</style>
