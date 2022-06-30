<template>
  <div class="table-cell">Количество</div>
  <div class="table-cell">Сумма</div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include act-table-cell;
  width: auto;
  text-align: center;

  &:first-of-type {
    min-width: unset;
  }
}
</style>
