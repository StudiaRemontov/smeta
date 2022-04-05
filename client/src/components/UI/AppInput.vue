<script>
export default {
  modelValue: {
    required: true,
    default: '',
  },
  emits: ['update:modelValue'],
  methods: {
    focus() {
      this.$refs.input.focus()
    },
  },
}
</script>

<template>
  <input ref="input" class="app-input" type="text" />
</template>

<style lang="scss" scoped>
.app-input {
  border: none;
  outline: none;
}
</style>
