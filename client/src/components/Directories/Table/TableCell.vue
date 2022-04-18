<script>
import keyTypes from '@/mixins/keyTypes.mixin'
import rootGetters from '@/mixins/rootGetters.mixin'
import { mapGetters } from 'vuex'

export default {
  mixins: [keyTypes, rootGetters],
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
    ...mapGetters('directory', ['directories', 'root']),
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
      const root = this.directories.find(d => d._id === this.col.root)
      if (!root) {
        return []
      }
      const keys = root.keys.filter(k => this.col.keys.includes(k.id))
      if (!keys.length) {
        return []
      }
      const directoryOfValues = this.directories.find(
        d => d._id === this.col.dirId,
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
          value: row.id,
          text: text.join(', '),
        }
      })
    },
  },
  methods: {
    getValueOfCell(dirId, root, rowId, keys) {
      const directory = this.directories.find(d => d._id === dirId)
      if (!directory) return null
      const rootDir = this.directories.find(d => d._id === root)
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
      class="select"
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
  min-width: 100px;
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  color: white;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  padding: 8px;
  color: #000000;
  line-height: 17px;
}
.input,
.select {
  background-color: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid #9c9c9c;
  width: 100%;
}
</style>
