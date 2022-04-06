<script>
import { mapGetters, mapMutations } from 'vuex'
import keyTypes from '@/mixins/keyTypes.mixin'

import DirectoryList from '@/components/PriceLists/Create/DirectoryList.vue'

export default {
  components: {
    DirectoryList,
  },
  mixins: [keyTypes],
  data() {
    return {
      directoriesClone: [],
    }
  },
  computed: {
    ...mapGetters('edition', ['clonedDirectories']),
    ...mapGetters('directory', ['directories']),
    rootDirs() {
      return this.clonedDirectories.filter(d => !d.parent)
    },
  },
  mounted() {
    // удалить пустые справочники
    const filteredDirectories = JSON.parse(
      JSON.stringify(this.directories),
    ).filter(d => {
      const children = this.directories.find(c => c.parent === d._id)
      return d.data || children
    })
    const cloned = filteredDirectories.map(directory => {
      if (!directory.data) {
        return directory
      }

      directory.data.keys = directory.data.keys.map(key => ({
        ...key,
        checked: true,
        readonly: true,
      }))

      const keysTypeSelect = directory.data.keys.filter(
        k => k.type === this.InputType.SELECT,
      )

      if (keysTypeSelect.length === 0) {
        return directory
      }

      directory.data.values = directory.data.values.map(row => {
        row.data = Object.entries(row.data).reduce((acc, [key, value]) => {
          const selectKey = keysTypeSelect.find(k => k.id === +key)
          if (!selectKey) {
            acc[key] = value
            return acc
          }
          const findingRow = value
          const vals = this.getValueOfCell(
            selectKey.dirId,
            findingRow,
            selectKey.keys,
          )

          acc[key] = vals.join(', ')
          return acc
        }, {})
        return {
          ...row,
          checked: false,
        }
      })

      return directory
    })
    this.setClonedDirectories(cloned)
  },
  methods: {
    ...mapMutations('edition', ['setClonedDirectories']),
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
  <div>
    <span class="page-title">Создать редакцию</span>
    <div class="input-field">
      <label>Название</label>
      <input class="input" type="text" />
    </div>
    <DirectoryList class="root" :directories="rootDirs" />
  </div>
</template>

<style lang="scss" scoped>
.root {
  padding-left: 0;
}
</style>
