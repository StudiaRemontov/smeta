<script>
import { mapGetters } from 'vuex'
import CloneActions from '../TableCells/CloneActions.vue'
import ViewCell from '../TableCells/ViewCell.vue'
import PriceCell from '../TableCells/Editable/PriceCell.vue'
import SelectCell from '../TableCells/Editable/SelectCell.vue'

import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: { CloneActions, ViewCell, PriceCell, SelectCell },
  mixins: [keyTypes],
  props: {
    node: {
      type: Object,
      default() {
        return {}
      },
    },
    sum: {
      type: Number,
      required: true,
    },
    isEditing: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['toggleEdit', 'remove'],
  computed: {
    ...mapGetters('directory', ['directories', 'roots']),
    ...mapGetters('outlay', ['keys', 'edition']),
    data() {
      return this.node.data
    },
    keysWithType() {
      return this.keys.map(key => {
        const directory = this.directories.find(
          d => d._id === this.edition.dirId,
        )
        const dirKey = directory.keys.find(k => k.id === key.id)
        const typedKey = this.keys.find(k => k.id === key.id)
        return {
          ...typedKey,
          type: dirKey.type,
        }
      })
    },
    options() {
      const selectKeys = this.keysWithType.filter(
        k => k.type === this.InputType.SELECT,
      )
      return selectKeys.reduce((acc, selectKey) => {
        const root = this.roots.find(d => d._id === this.edition.dirId)
        const key = root.keys.find(k => k.id === selectKey.id)
        const keyRoot = this.roots.find(r => r._id === key.root)

        const keys = keyRoot.keys.filter(k => key.keys.includes(k.id))

        if (!keys.length) {
          return []
        }
        const directoryOfValues = this.directories.find(
          d => d._id === key.dirId,
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

        acc[selectKey.id] = values

        return acc
      }, {})
    },
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
  <template v-if="!isEditing">
    <ViewCell
      v-for="key in keys"
      :key="key.id"
      :keyData="key"
      :value="data[key.id]"
    />
  </template>
  <td
    v-else
    v-for="key in keysWithType"
    :key="key.id"
    class="table-cell"
    @click.stop
  >
    <input
      v-if="key.type === InputType.STRING"
      v-model="data[key.id]"
      class="input"
      type="text"
    />
    <input
      v-else-if="
        key.type === InputType.NUMBER || key.type === InputType.QUANTITY
      "
      v-model="data[key.id]"
      class="input"
      type="number"
    />
    <PriceCell
      v-else-if="key.type === InputType.PRICE"
      v-model="data[key.id]"
    />
    <SelectCell
      v-else-if="key.type === InputType.SELECT"
      v-model="data[key.id]"
      :options="options[key.id]"
    />
  </td>
  <ViewCell :value="sum" :isSum="true" />
  <CloneActions
    :isEditing="isEditing"
    @toggleEdit="$emit('toggleEdit')"
    @remove="$emit('remove')"
  />
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}

.input {
  max-width: 100%;
  width: 100%;
}
</style>
