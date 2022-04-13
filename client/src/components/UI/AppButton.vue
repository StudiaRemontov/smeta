<script>
export default {
  props: {
    outlined: Boolean,
    variant: String,
  },
}
</script>

<template>
  <button :class="[`app-button`, variant, { outlined }]">
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

  &.danger {
    border-color: $color-danger;
    color: $color-danger;
  }

  &.primary {
    border-color: $color-primary;
    color: $color-primary;
  }
}
</style>
