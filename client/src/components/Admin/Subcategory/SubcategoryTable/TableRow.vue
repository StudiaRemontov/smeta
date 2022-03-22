<script>
export default {
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
  },
  computed: {
    jobNames() {
      return this.rowData.jobs.map(({ name }) => name).join(', ')
    },
  },
}
</script>

<template>
  <tr class="table-row">
    <td class="table-cell">
      {{ rowIndex + 1 }}
    </td>
    <td class="table-cell">
      {{ rowData.name }}
    </td>
    <td class="table-cell">
      {{ jobNames }}
    </td>
    <td class="table-cell">
      <AppButton variant="primary"> Редактировать </AppButton>
    </td>
  </tr>
</template>
