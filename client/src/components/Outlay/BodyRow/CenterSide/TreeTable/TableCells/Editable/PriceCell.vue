<script>
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
      coef: 1,
      initPrice: null,
    }
  },
  computed: {
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        const fixed = +value.toFixed(2)
        this.$emit('update:modelValue', fixed)
      },
    },
  },
  mounted() {
    this.initPrice = this.modelValue
  },
  methods: {
    changePrice(value) {
      if (value < 1) {
        this.newValue = 1
      }
      this.initPrice = value
      this.coef = 1
    },
    inputCoef() {
      if (this.coef < 1) this.coef = 1
      this.newValue = this.initPrice * this.coef
    },
  },
}
</script>

<template>
  <div class="price-cell">
    <InputNumber
      v-model="newValue"
      class="price"
      @update:modelValue="changePrice"
    />
    <InputNumber
      v-model="coef"
      class="coef"
      :step="0.1"
      @update:modelValue="inputCoef"
    />
  </div>
</template>

<style lang="scss" scoped>
.price-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.input {
  width: 60px;
}

.coef {
  width: 30px;
}
</style>
