<script>
import TableCellWrapper from './TableCellWrapper.vue'
import InputNumber from '@/components/UI/InputNumber.vue'

export default {
  components: { TableCellWrapper, InputNumber },
  props: {
    modelValue: {
      required: true,
    },
  },
  emits: ['update:modelValue', 'change'],
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
  <TableCellWrapper>
    <InputNumber v-model="newValue" class="input" @click.stop />
  </TableCellWrapper>
</template>

<style lang="scss" scoped>
.input {
  max-width: 100%;
  width: 100%;
  text-align: center;
}
</style>
