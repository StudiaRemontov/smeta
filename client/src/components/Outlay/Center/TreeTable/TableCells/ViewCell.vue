<script>
export default {
  props: {
    value: {
      required: true,
    },
  },
}
</script>

<template>
  <td class="table-cell">
    {{ value }}
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
