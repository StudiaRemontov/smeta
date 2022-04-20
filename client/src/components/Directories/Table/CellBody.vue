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
    text() {
      if (this.type === this.InputType.SELECT) {
        const values = this.getValueOfCell(
          this.key.dirId,
          this.key.root,
          this.value,
          this.key.keys,
        )
        return values.join(', ') || 'Пусто'
      }
      if (this.type === this.InputType.NUMBER && !this.value) {
        return 0
      }
      return this.value || 'Пусто'
    },
  },
  methods: {
    getValueOfCell(dirId, root, rowId, keys) {
      const directory = this.directories.find(d => d._id === dirId)
      if (!directory) return null
      const rootDir = this.roots.find(d => d._id === root)
      const visibleKeys = rootDir.keys.filter(k => keys.includes(k.id))
      const vals = visibleKeys.map(key => {
        const row = directory.values.find(r => r.id === rowId)
        if (key.type === this.InputType.SELECT) {
          const findingRow = row.data[key.id]
          return this.getValueOfCell(key.dirId, key.root, findingRow, key.keys)
        }
        if (!row) {
          return null
        }
        return row.data[key.id]
      })
      return vals
    },
  },
}
</script>

<template>
  <span>
    {{ text }}
  </span>
</template>
