<script>
import keyTypes from '@/mixins/keyTypes.mixin'

import { mapGetters } from 'vuex'

export default {
  mixins: [keyTypes],
  props: {
    value: {
      required: true,
    },
    field: {
      required: true,
      type: String,
    },
    rowIndex: {
      required: true,
      type: Number,
    },
  },
  emits: ['change'],
  data() {
    return {
      timeout: null,
      hasUnmounted: false,
    }
  },
  computed: {
    ...mapGetters('directory', ['root', 'roots', 'directories']),
    key() {
      return this.root.keys.find(k => k.id === this.field)
    },
    type() {
      return this.key?.type
    },
    componentName() {
      const numberComponents = [
        this.InputType.NUMBER,
        this.InputType.PRICE,
        this.InputType.QUANTITY,
      ]
      const selectComponents = [this.InputType.SELECT, this.InputType.FORMULA]
      if (numberComponents.includes(this.type)) {
        return 'InputNumber'
      }
      if (selectComponents.includes(this.type)) {
        return 'Dropdown'
      }
      return 'InputText'
    },
    newValue: {
      get() {
        return this.value
      },
      set(value) {
        const numberTypes = [
          this.InputType.PRICE,
          this.InputType.QUANTITY,
          this.InputType.NUMBER,
        ]
        if (numberTypes.includes(this.type)) {
          if (this.timeout) {
            clearTimeout(this.timeout)
          }
          this.timeout = setTimeout(() => {
            if (!this.hasUnmounted) {
              return this.$emit('change', this.rowIndex, this.field, value)
            }
          }, 300)
          return
        }
        this.$emit('change', this.rowIndex, this.field, value)
      },
    },
    options() {
      if (
        this.type !== this.InputType.SELECT &&
        this.type !== this.InputType.FORMULA
      ) {
        return []
      }

      const root = this.roots.find(d => d._id === this.key.root)
      if (!root) {
        return []
      }
      const keys = root.keys.filter(k => this.key.keys.includes(k.id))
      if (!keys.length) {
        return []
      }
      const directoryOfValues = this.directories.find(
        d => d._id === this.key.dirId,
      )
      const values = directoryOfValues.values.map(row => {
        const text = keys.map(key => {
          if (key.type === this.InputType.SELECT) {
            const findingRow = row.data[key.id]
            return this.getValueOfCell(
              key.dirId,
              key.root,
              findingRow,
              key.keys,
            )
          }

          return row.data[key.id]
        })
        return {
          value: row.id,
          text: text.join(', '),
        }
      })

      return [
        { value: undefined, text: 'Выберите значение', hidden: true },
        ...values,
      ]
    },
  },
  unmounted() {
    this.hasUnmounted = true
  },
  methods: {
    getValueOfCell(dirId, root, rowId, keys) {
      const directory = this.directories.find(d => d._id === dirId)
      if (!directory) return null
      const rootDir = this.roots.find(d => d._id === root)
      const visibleKeys = rootDir.keys.filter(k => keys.includes(k.id))
      const vals = visibleKeys.map(key => {
        const row = directory.values.find(r => r.id === +rowId)
        if (key.type === this.InputType.SELECT) {
          const findingRow = row.data[key.id]
          return this.getValueOfCell(key.dirId, key.root, findingRow, key.keys)
        }

        return row.data[key.id]
      })
      return vals
    },
  },
}
</script>

<template>
  <input
    v-if="type === InputType.STRING"
    v-model.lazy="newValue"
    class="input"
    placeholder="Введите значение"
    type="text"
  />
  <input
    v-else-if="type === InputType.NUMBER"
    v-model.lazy="newValue"
    class="input"
    placeholder="Введите значение"
    type="number"
  />
  <input
    v-else-if="type === InputType.PRICE || type === InputType.QUANTITY"
    v-model.lazy="newValue"
    class="input"
    placeholder="Введите значение"
    type="number"
    :min="0"
  />
  <select
    v-else-if="type === InputType.SELECT || type === InputType.FORMULA"
    v-model="newValue"
    class="input"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :hidden="option.hidden"
      :value="option.value"
    >
      {{ option.text }}
    </option>
  </select>
</template>

<style lang="scss" scoped>
.input {
  max-width: 100%;
  outline: none;
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 6px;

  &:focus {
    border-color: #3b82f6;
  }
}
</style>
