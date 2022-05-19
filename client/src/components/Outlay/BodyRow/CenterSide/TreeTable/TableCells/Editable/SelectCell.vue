<script>
export default {
  props: {
    modelValue: {
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
}
</script>

<template>
  <select v-model="newValue" class="select">
    <option v-for="option in options" :key="option.value" :value="option.text">
      {{ option.text }}
    </option>
  </select>
</template>

<style lang="scss" scoped>
.select {
  max-width: 100%;
  width: 100%;
}
</style>
