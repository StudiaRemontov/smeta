<script>
export default {
  props: {
    value: {
      required: true,
    },
    valueType: {
      default: 'string',
    },
  },
}
</script>

<template>
  <td class="table-cell">
    <input class="table-cell__value" :value="value" type="text" />
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  text-align: left;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
