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
        this.$emit('update:modelValue', value)
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
      this.newValue = +(this.initPrice * this.coef).toFixed(2)
    },
  },
}
</script>

<template>
  <div class="price-cell">
    <input
      v-model="newValue"
      class="input"
      type="number"
      :min="1"
      @input="changePrice"
    />
    <input
      v-model="coef"
      class="input"
      type="number"
      :min="1"
      :step="0.1"
      @input="inputCoef"
    />
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
