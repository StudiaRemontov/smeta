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

  &:not(.striped).hovered {
    background-color: #e1e1e1;
  }

  &.selected:not(.category) {
    background-color: #e0ffc0;
  }

  &.oranged {
    background-color: #ffdc9a;
  }

  &.oranged.hovered,
  &.oranged.selected {
    background-color: #ffe2ac;
  }
}
</style>
