<script>
import TableRow from './JobTable/TableRow.vue'

export default {
  components: {
    TableRow,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      keys: ['Название', 'Ед. изм.', 'Цена', 'Действия'],
    }
  },
  methods: {
    removeJob(id) {
      this.$emit('remove', id)
    },
  },
}
</script>

<template>
  <table class="job-table">
    <tr class="job-table__row">
      <th class="table-cell table-cell--head">#</th>
      <th v-for="key in keys" :key="key" class="table-cell table-cell--head">
        {{ key }}
      </th>
    </tr>
    <TableRow
      v-for="(row, index) in data"
      v-model:name="row.name"
      v-model:unit="row.unit"
      v-model:price="row.price"
      :key="row.id"
      :rowIndex="index"
      @remove="removeJob(row.id)"
    />
  </table>
</template>

<style lang="scss" scoped>
.job-table {
  table-layout: fixed;
  width: 100%;
  height: 100%;
  border-collapse: collapse;
}
</style>
