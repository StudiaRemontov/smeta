<script>
export default {
  props: {
    modelValue: {
      reduired: true,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      valueBefore: '',
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
  watch: {
    newValue(_, old) {
      this.valueBefore = old
    },
  },
  methods: {
    inputHandler(e) {
      const { target } = e
      const { value } = target
      const regex = /^[0-9+-/*.,]*$/
      const isValid = regex.test(value)
      if (!isValid) {
        target.value = this.valueBefore
        return
      }
      const { data } = e
      if (data === ',') {
        const newValue = value.replace(',', '.')
        target.value = newValue
        this.newValue = newValue
      }
      const numberRegex = /[-]?\d+(\.\d+)?/g
      const matches = value.match(numberRegex)
      if (!matches) {
        this.newValue = '0'
        return
      }
      matches.forEach(n => {
        const num = +n
        if (num > 0) {
          const newValue = target.value.replace(n, num)
          target.value = newValue
          this.newValue = newValue
        }
      })
    },
    onKeyDown(e) {
      const { key, ctrlKey } = e
      if (key === 'Space') {
        return e.preventDefault()
      }
      const avaliableKeys = [
        'ArrowRight',
        'ArrowLeft',
        'Backspace',
        'Tab',
        'F5',
      ]
      if (avaliableKeys.includes(key) || (ctrlKey && /a/i.test(key))) {
        return
      }

      const regex = /^[0-9.,+-/*]*$/
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
    class="input-number"
    type="text"
    @input="inputHandler"
    @keydown="onKeyDown"
  />
</template>

<style lang="scss" scoped>
.input-number {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}
</style>
