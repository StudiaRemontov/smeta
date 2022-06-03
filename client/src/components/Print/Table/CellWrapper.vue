<script>
export default {
  props: {
    result: Boolean,
    category: Boolean,
    right: Boolean,
    colspan: Number,
  },
}
</script>

<template>
  <td
    class="table-cell"
    :class="{ result, category, right }"
    :colspan="colspan"
  >
    <slot />
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  -webkit-print-color-adjust: exact;
  max-width: 100px;
  width: 100px;
  border-bottom: 1px solid #a7a7a7;
  font-size: 11px;
  padding: 8px;

  &:not(:first-child) {
    text-align: center;
  }

  &.result {
    text-align: right !important;
    font-size: 11px;
    font-weight: 700;
  }

  &.category {
    font-size: 14px;
    color: black;
    font-weight: 700;
    text-align: center;
  }

  &.right {
    text-align: right !important;
  }
}
</style>
