<script>
import keyTypes from '@/mixins/keyTypes.mixin'

import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import { mapGetters } from 'vuex'

export default {
  components: {
    InputText,
    InputNumber,
    Dropdown,
  },
  mixins: [keyTypes],
  props: {
    modelValue: {
      required: true,
    },
    field: {
      required: true,
      type: String,
    },
    root: {
      required: true,
      type: Object,
    },
    updated: {
      type: Boolean,
      default: false,
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  computed: {
    ...mapGetters('directory', ['roots', 'directories']),
    key() {
      return this.root.keys.find(k => k.id === this.field)
    },
    type() {
      return this.key?.type
    },
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    options() {
      if (this.type !== this.InputType.SELECT) {
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
      return directoryOfValues.values.map(row => {
        const text = keys.map(key => {
          if (
            key.type === this.InputType.SELECT ||
            key.type === this.InputType.FORMULA
          ) {
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
          hidden: false,
          text: text.join(', '),
        }
      })
    },
  },
  mounted() {
    if (this.type !== this.InputType.SELECT) {
      return
    }
    const isExists = !!this.options.find(o => o.text === this.modelValue)
    if (!isExists) {
      this.newValue = this.options[0].text
    }
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
  <InputText
    v-if="type === InputType.STRING"
    v-model="newValue"
    placeholder="Введите значение"
    :disabled="disabled"
    :class="{ updated }"
  />
  <InputNumber
    v-else-if="type === InputType.NUMBER"
    v-model="newValue"
    :format="false"
    placeholder="Введите значение"
    :disabled="disabled"
    :class="{ updated }"
  />
  <Dropdown
    v-else-if="type === InputType.SELECT"
    v-model="newValue"
    placeholder="Введите значение"
    :options="options"
    optionLabel="text"
    optionValue="text"
    :disabled="disabled"
    :class="{ updated }"
  />
  <Dropdown
    v-else-if="type === InputType.FORMULA"
    v-model="newValue"
    placeholder="Введите значение"
    :options="formulaOptions"
    :disabled="disabled"
    :class="{ updated }"
  />
</template>

<style lang="scss">
.p-inputnumber.updated {
  .p-inputnumber-input {
    border-color: #2196f3 !important;
  }
}
</style>
