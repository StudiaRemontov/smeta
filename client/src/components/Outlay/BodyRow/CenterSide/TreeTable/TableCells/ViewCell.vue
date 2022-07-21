<script>
export default {
  inject: ['changed'],
  props: {
    value: {
      required: true,
    },
    isClone: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    index: Number,
  },
  computed: {
    isValidQuantity() {
      return this.value > 0
    },
  },
}
</script>

<template>
  <div
    class="table-cell"
    :class="{ danger: !isValidQuantity && isClone && selected }"
    :title="value"
    :data-cellIndex="index"
  >
    <span v-if="index === 0 && changed"> * </span>
    {{ value }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &.danger {
    color: #ff3737;
    font-weight: 600;
    border-bottom: #ff3737 1px solid;
  }
}
</style>
