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
      if (this.type === this.InputType.SELECT) {
        const directory = this.directories.find(d => d._id === this.col.dirId)
        return directory.data.values.map(item => {
          const avaliableKeys = this.col.keys.map(key => {
            return item.data[key]
          })

          return {
            id: item.id,
            value: avaliableKeys.join(', '),
          }
        })
      }

      return []
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
      <option v-for="option in options" :key="option.id" :value="option.id">
        {{ option.value }}
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
