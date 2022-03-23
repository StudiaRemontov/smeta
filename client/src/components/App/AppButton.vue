<script>
export default {
  props: {
    variant: {
      type: String,
    },
    to: {
      type: [String, Object],
      default: null,
    },
  },
  computed: {
    type() {
      if (this.to) {
        return 'router-link'
      }

      return 'button'
    },
  },
}
</script>

<template>
  <component class="button" :class="[variant]" :is="type" :to="to">
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.button {
  border: none;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.primary {
  color: #fff;
  background-color: $color-primary;
}

.success {
  color: #fff;
  background-color: $color-success;
}

.danger {
  color: #fff;
  background-color: $color-danger;
}
</style>
