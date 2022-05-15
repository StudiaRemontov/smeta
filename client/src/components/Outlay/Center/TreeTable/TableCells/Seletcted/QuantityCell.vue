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
  <td class="table-cell" @click.stop="toggleEditMode">
    <div class="table-cell__wrapper">
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
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  max-width: 100px;
  @include table-cell;
}

.input {
  max-width: 100%;
  width: 100%;
}
</style>
