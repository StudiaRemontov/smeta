<script>
import TableCellWrapper from './TableCellWrapper.vue'
import InputNumber from '@/components/UI/InputNumber.vue'

export default {
  components: { TableCellWrapper, InputNumber },
  inject: ['selectedNodes'],
  props: {
    modelValue: {
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'change', 'focused', 'blured'],
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
  methods: {
    onFocus() {
      this.$emit('focused')
    },
    async onBlur() {
      this.$emit('blured')
    },
  },
}
</script>

<template>
  <TableCellWrapper>
    <InputNumber
      v-model="newValue"
      class="input"
      :class="{ invalid: selected && newValue === 0 }"
      @mousedown.stop
      @focus="onFocus"
      @blur="onBlur"
    />
  </TableCellWrapper>
</template>

<style lang="scss" scoped>
.input {
  max-width: 100%;
  width: 100%;
  text-align: center;
}
</style>
