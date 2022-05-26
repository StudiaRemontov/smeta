<script>
import { formatNumber } from '@/helpers/formatNumber'

import InputNumber from '@/components/UI/InputNumber.vue'

export default {
  components: { InputNumber },
  props: {
    modelValue: {
      required: true,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isEditing: false,
    }
  },
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
  methods: {
    toggleEditMode() {
      if (this.isEditing) {
        return this.closeEditMode()
      }
      this.openEditMode()
    },
    async openEditMode() {
      this.isEditing = true
      await this.$nextTick()
      const { input } = this.$refs
      input.$el.focus()
      input.$el.select()
    },
    closeEditMode() {
      this.isEditing = false
    },
  },
}
</script>

<template>
  <div
    class="table-cell"
    :class="{ danger: !isCorrectValue }"
    @click.stop="toggleEditMode"
  >
    <span v-if="!isEditing">
      {{ viewValue }}
    </span>
    <InputNumber
      v-else
      v-model="newValue"
      class="input"
      ref="input"
      @blur="isEditing = false"
      @keyup.enter="isEditing = false"
      @keydown.stop
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
}
</style>
