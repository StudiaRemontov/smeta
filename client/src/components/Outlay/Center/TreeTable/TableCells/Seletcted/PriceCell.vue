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
      coef: 1,
      initValue: null,
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
  mounted() {
    this.initValue = this.modelValue
  },
  methods: {
    changePrice() {
      if (this.coef < 1) this.coef = 1
      this.newValue = +(this.initValue * this.coef).toFixed(2)
    },
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
      <span>
        {{ modelValue }}
      </span>
      <template v-if="isEditing">
        <span>x</span>
        <input
          v-model="coef"
          class="input"
          ref="input"
          type="number"
          :min="1"
          :step="0.1"
          @input="changePrice"
          @blur="isEditing = false"
        />
      </template>
    </div>
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.input {
  width: 30px;
}
</style>
