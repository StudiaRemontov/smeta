<script>
export default {
  emits: ['clone'],
}
</script>

<template>
  <div class="table-cell table-cell--actions">
    <button class="button" @click.stop="this.$emit('clone')">
      <i class="pi pi-copy"></i>
    </button>
  </div>
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
