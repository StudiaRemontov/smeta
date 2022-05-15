<script>
export default {
  props: {
    isEditing: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['toggleEdit', 'remove'],
}
</script>

<template>
  <td class="table-cell table-cell--actions">
    <button class="button" @click.stop="$emit('toggleEdit')">
      <i v-if="isEditing" class="pi pi-check"></i>
      <i v-else class="pi pi-pencil"></i>
    </button>
    <button class="button" @click.stop="$emit('remove')">
      <i class="pi pi-trash"></i>
    </button>
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &--actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}
</style>
