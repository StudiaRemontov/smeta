<script>
import { formatNumber } from '@/helpers/formatNumber'

import InputNumber from '@/components/UI/InputNumber.vue'

export default {
  components: { InputNumber },
  props: {
    modelValue: {
      required: true,
    },
    isEditing: Boolean,
  },
  emits: ['update:modelValue', 'save'],
  computed: {
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        if (value < 0) {
          return this.$emit('update:modelValue', 0)
        }
        this.$emit('update:modelValue', value)
      },
    },
    isCorrectValue() {
      return this.modelValue > 0
    },
    viewValue() {
      return formatNumber(this.modelValue)
    },
  },
  watch: {
    isEditing(value) {
      if (!value) return
      this.openEditMode()
    },
  },
  methods: {
    async openEditMode() {
      await this.$nextTick()
      const { input } = this.$refs
      input.$el.focus()
      input.$el.select()
    },
    save() {
      this.$emit('save')
    },
  },
}
</script>

<template>
  <div class="table-cell" :class="{ danger: !isCorrectValue }">
    <span v-if="!isEditing">
      {{ viewValue }}
    </span>
    <InputNumber
      v-else
      v-model="newValue"
      class="input"
      ref="input"
      @blur="save"
      @keyup.enter="save"
    />
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &.danger {
    color: #ff3737;
    font-weight: 600;
    border-bottom: #ff3737 1px solid;
  }
}

.input {
  max-width: 100%;
  width: 100%;
  text-align: center;
}
</style>
