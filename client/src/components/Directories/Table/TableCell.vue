<script>
import keyTypes from '@/mixins/keyTypes.mixin'

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'

import { mapGetters } from 'vuex'

export default {
  components: {
    InputText,
    Dropdown,
    InputNumber,
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
    rowIndex: {
      required: true,
      type: Number,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    ...mapGetters('directory', ['root', 'roots', 'directories']),
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
          hidden: false,
          value: row.id,
          text: text.join(', '),
        }
      })
    },
  },
  mounted() {
    this.$refs?.dropdown?.show()
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
  />
  <InputNumber
    v-else-if="type === InputType.NUMBER"
    v-model="newValue"
    :format="false"
    placeholder="Введите значение"
  />
  <Dropdown
    v-else-if="type === InputType.SELECT"
    v-model="newValue"
    ref="dropdown"
    placeholder="Введите значение"
    :options="options"
    optionLabel="text"
    optionValue="value"
  />
</template>
