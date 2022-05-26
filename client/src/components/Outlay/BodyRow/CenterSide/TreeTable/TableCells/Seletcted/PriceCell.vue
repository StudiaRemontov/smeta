<script>
import InputNumber from '@/components/UI/InputNumber.vue'
import { formatNumber } from '@/helpers/formatNumber'

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
    viewValue() {
      return formatNumber(this.modelValue)
    },
  },
  mounted() {
    this.initValue = this.modelValue
  },
  methods: {
    changePrice() {
      if (this.coef < 1) this.coef = 1
      this.newValue = this.initValue * this.coef
    },
    async toggleEditMode() {
      this.isEditing = !this.isEditing
      if (this.isEditing) {
        await this.$nextTick()
        const { input } = this.$refs
        input.$el.focus()
        input.$el.select()
      }
    },
  },
}
</script>

<template>
  <div class="table-cell" @click.stop="toggleEditMode">
    <div class="table-cell__wrapper">
      <span>
        {{ viewValue }}
      </span>
      <template v-if="isEditing">
        <span>x</span>
        <InputNumber
          v-model="coef"
          class="input"
          ref="input"
          @input="changePrice"
          @blur="isEditing = false"
          @keyup.enter="isEditing = false"
        />
      </template>
    </div>
  </div>
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
