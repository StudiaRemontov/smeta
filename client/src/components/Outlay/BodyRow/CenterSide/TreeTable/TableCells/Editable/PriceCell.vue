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
    changePrice() {
      if (this.newValue < 1) {
        this.newValue = 1
      }
      this.initPrice = this.newValue
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
    <InputNumber v-model="newValue" class="input" @input="changePrice" />
    <InputNumber v-model="coef" class="input" @input="inputCoef" />
  </div>
</template>

<style lang="scss" scoped>
.price-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.input {
  width: 30px;
}
</style>
