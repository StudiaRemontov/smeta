<script>
export default {
  emits: ['clone'],
}
</script>

<template>
  <td class="table-cell table-cell--actions">
    <button class="button" @click.stop="this.$emit('clone')">
      <i class="pi pi-copy"></i>
    </button>
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &__actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>
