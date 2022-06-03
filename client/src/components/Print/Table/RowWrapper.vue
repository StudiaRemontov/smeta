<script>
export default {
  props: {
    bold: Boolean,
    results: Boolean,
    category: Boolean,
  },
}
</script>

<template>
  <tr class="table-row" :class="{ bold, results, category }">
    <slot />
  </tr>
</template>

<style lang="scss" scoped>
.table-row {
  break-inside: avoid;
  -webkit-print-color-adjust: exact;

  &.bold {
    color: black;
    font-weight: 700;
  }

  &.results {
    background-color: #fffecd;
  }

  &.category {
    background-color: #e4e4e4;
  }
}
</style>
