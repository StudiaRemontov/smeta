<script>
export default {
  props: {
    outlined: Boolean,
  },
}
</script>

<template>
  <button class="app-button" :class="{ outlined }">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.app-button {
  background-color: transparent;
  border: none;
  cursor: pointer;

  &.outlined {
    background: #ffffff;
    padding: 10px;
    border: 1px solid #a7a7a7;
    border-radius: 3px;
  }
}
</style>
