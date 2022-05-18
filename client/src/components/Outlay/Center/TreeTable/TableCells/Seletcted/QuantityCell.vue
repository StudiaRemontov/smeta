<script>
export default {
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
        this.$emit('update:modelValue', value)
      },
    },
    isCorrectValue() {
      return this.modelValue > 0
    },
  },
  methods: {
    async toggleEditMode() {
      this.isEditing = !this.isEditing
      if (this.isEditing) {
        await this.$nextTick()
        const { input } = this.$refs
        input.focus()
      }
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
      {{ modelValue }}
    </span>
    <input
      v-else
      v-model="newValue"
      class="input"
      ref="input"
      type="number"
      :min="1"
      @blur="isEditing = false"
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
