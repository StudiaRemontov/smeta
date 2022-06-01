<script>
export default {
  props: {
    modelValue: {
      default: 0,
    },
    min: Number,
    max: Number,
    step: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      value: null,
    }
  },
  computed: {
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        return this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    inputHandler(e) {
      const { data, target } = e
      let value = target.value
      if (data === ',') {
        value = value.replace(',', '.')
        target.value = value
      }
      const isValueIncludesDot = value.includes('.')
      if (!isValueIncludesDot) {
        const number = +value
        this.newValue = number
        return
      }

      const valueParts = value.split('.')
      if (valueParts.length !== 2) {
        return
      }
      const isValidParts = valueParts.every(v => v)
      if (!isValidParts) {
        // try to change target value
        return
      }
      const number = +value
      this.newValue = number
    },
    increaseValue() {
      this.newValue = this.newValue + this.step
    },
    decreaseValue() {
      this.newValue = this.newValue - this.step
    },
    checkKey(e) {
      const regex = /^[0-9.,]*$/
      const { key, ctrlKey } = e
      if (key === 'ArrowUp') {
        e.preventDefault()
        return this.increaseValue()
      }
      if (key === 'ArrowDown') {
        e.preventDefault()
        return this.decreaseValue()
      }
      if (key === 'Space') {
        return e.preventDefault()
      }
      const avaliableKeys = ['ArrowRight', 'ArrowLeft', 'Backspace', 'Tab']
      if (avaliableKeys.includes(key) || (ctrlKey && /a/i.test(key))) {
        return
      }
      const isValid = regex.test(key)
      if (!isValid) {
        e.preventDefault()
      }
    },
  },
}
</script>

<template>
  <input
    :value="newValue"
    class="input"
    ref="input"
    type="text"
    @input="inputHandler"
    @keydown="checkKey"
  />
</template>
