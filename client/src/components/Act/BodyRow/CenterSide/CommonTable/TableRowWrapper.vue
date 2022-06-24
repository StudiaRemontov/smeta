<template>
  <div class="table-row-wrapper">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.table-row-wrapper {
  display: grid;
  background-color: #fff;
  align-items: center;
  overflow: hidden;
  height: 32px;

  &.hovered {
    background-color: #e1e1e1;
  }

  &.selected {
    background-color: #e0ffc0;
  }
}
</style>
