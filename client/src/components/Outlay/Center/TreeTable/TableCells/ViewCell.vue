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
  <div class="table-cell">
    {{ value }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
