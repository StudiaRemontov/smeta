<template>
  <div class="table-cell">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
