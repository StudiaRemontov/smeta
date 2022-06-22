<script>
export default {
  props: {
    modelValue: {
      default: 0,
    },
    min: {
      type: Number,
      default: Number.MIN_VALUE,
    },
    max: {
      type: Number,
      default: Number.MAX_VALUE,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  emits: ['update:modelValue', 'change'],
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
        this.$emit('update:modelValue', value)
        this.$emit('change', value)
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
      const newValue = this.newValue + this.step
      if (this.max >= newValue) {
        this.newValue = newValue
      }
    },
    decreaseValue() {
      const newValue = this.newValue - this.step
      if (this.min <= newValue) {
        this.newValue = newValue
      }
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
    enterHandler() {
      this.$refs.input.blur()
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
    @change="$emit('change', $event.target.value)"
    @keyup.enter="enterHandler"
  />
</template>
