<script>
import InputNumber from '@/components/UI/InputNumber.vue'
import { formatNumber } from '@/helpers/formatNumber'

export default {
  components: { InputNumber },
  props: {
    price: {
      required: true,
    },
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
    viewValue() {
      return formatNumber(this.modelValue)
    },
  },
  methods: {
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
  <div v-if="isEditing" class="blocker"></div>
  <div class="table-cell" @click.stop="toggleEditMode">
    <div class="table-cell__wrapper">
      <span>
        {{ price }} <template v-if="!isEditing"> ({{ newValue }}) </template>
      </span>
      <template v-if="isEditing">
        <span>x</span>
        <InputNumber
          v-model="newValue"
          class="input"
          ref="input"
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
    justify-content: center;
    gap: 5px;
  }
}

.input {
  width: 30px;
}

.blocker {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
