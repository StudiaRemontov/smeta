<script>
import keyTypes from '@/mixins/keyTypes.mixin'
import { mapGetters } from 'vuex'

export default {
  mixins: [keyTypes],
  props: {
    value: {
      required: true,
    },
    rowIndex: {
      required: true,
      type: Number,
    },
    rowId: {
      required: true,
      type: Number,
    },
    col: {
      type: Object,
      required: true,
    },
    dirId: {
      required: true,
    },
  },
  emits: ['change'],
  computed: {
    ...mapGetters('directory', ['directories']),
    type() {
      return this.col.type
    },
    inputType() {
      if (this.type === this.InputType.NUMBER) {
        return 'number'
      }

      return 'text'
    },
    options() {
      if (this.col.type !== this.InputType.SELECT) {
        return []
      }
      const subDir = this.directories.find(d => d._id === this.col.dirId)
      if (!subDir) {
        return []
      }
      const keys = subDir.data.keys.filter(k => this.col.keys.includes(k.id))

      if (!keys.length) {
        return []
      }
      return subDir.data.values.map(row => {
        const text = keys.map(key => {
          if (key.type === this.InputType.SELECT) {
            const findingRow = row.data[key.id]
            return this.getValueOfCell(key.dirId, findingRow, key.keys)
          }

          return row.data[key.id]
        })

        return {
          value: row.id,
          text: text.join(', '),
        }
      })
    },
  },
  methods: {
    getValueOfCell(dirId, rowId, keys) {
      const directory = this.directories.find(d => d._id === dirId)
      if (!directory) return null
      const visibleKeys = directory.data.keys.filter(k => keys.includes(k.id))
      const vals = visibleKeys.map(key => {
        const row = directory.data.values.find(r => r.id === +rowId)
        if (key.type === this.InputType.SELECT) {
          const findingRow = row.data[key.id]
          return this.getValueOfCell(key.dirId, findingRow, key.keys)
        }

        return row.data[key.id]
      })
      return vals
    },
  },
}
</script>

<template>
  <td class="table-cell">
    <input
      v-if="type === InputType.STRING || type === InputType.NUMBER"
      :value="value"
      class="input"
      :type="inputType"
      @change="$emit('change', rowId, col.id, $event.target.value)"
    />
    <select
      v-else
      :value="value"
      @change="$emit('change', rowId, col.id, $event.target.value)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  color: white;
  border-top: 1px solid #c8c8c8;
  border-bottom: 1px solid #c8c8c8;
  padding: 8px;
  color: #000000;
  line-height: 17px;
}
.input {
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
}
</style>
