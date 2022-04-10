<script>
import { mapGetters, mapMutations } from 'vuex'
import ContentBody from '@/components/Layout/ContentBody.vue'
import keyTypes from '@/mixins/keyTypes.mixin'
import rootGetters from '@/mixins/rootGetters.mixin'

import RootList from '@/components/PriceLists/Create/RootList.vue'

export default {
  components: {
    RootList,
    ContentBody,
  },
  mixins: [keyTypes, rootGetters],
  data() {
    return {
      name: '',
    }
  },
  computed: {
    ...mapGetters('edition', ['tree', 'clonedDirectories']),
    ...mapGetters('directory', ['directories', 'roots']),
    rootDirs() {
      return this.clonedDirectories.filter(d => !d.parent)
    },
  },
  mounted() {
    const clonedDirs = JSON.parse(JSON.stringify(this.directories))
    this.setClonedDirectories(clonedDirs)
    const roots = this.clonedDirectories.filter(d => !d.parent)
    const tree = roots.map(r => {
      const children = this.getChildren(r)
      r.subItems = children
      return r
    })
    this.setTree(tree)
  },
  methods: {
    ...mapMutations('edition', ['setTree', 'setClonedDirectories']),
    getValueOfCell(dirId, rowId, keys) {
      const directory = this.roots.find(d => d._id === dirId)

      if (!directory) return null
      const visibleKeys = directory.keys.filter(k => keys.includes(k.id))

      return visibleKeys.map(key => {
        const row = directory.values.find(r => r.id === +rowId)
        if (key.type === this.InputType.SELECT) {
          const findingRow = row.data[key.id]
          return this.getValueOfCell(key.dirId, findingRow, key.keys)
        }

        return row.data[key.id]
      })
    },
    getChildren(directory) {
      const children = this.clonedDirectories.filter(
        d => d.parent === directory._id,
      )
      if (children.length === 0 && !directory.values) {
        return []
      }

      const { values } = directory
      if (values && directory.parent) {
        const root = this.getRoot(directory.parent)
        const { keys } = root
        const keysTypeSelect = keys.filter(
          k => k.type === this.InputType.SELECT,
        )
        directory.values = values.map(row => {
          row.data = Object.entries(row.data).reduce((acc, [key, value]) => {
            const selectKey = keysTypeSelect.find(k => k.id === +key)

            if (selectKey) {
              const findingRow = value
              const text = this.getValueOfCell(
                selectKey.dirId,
                findingRow,
                selectKey.keys,
              )
              acc[key] = text.join(', ')
              return acc
            }
            acc[key] = value
            return acc
          }, {})
          return row
        })
      }
      return children.map(c => {
        const subChildren = this.getChildren(c)
        c.subItems = subChildren
        return c
      })
    },
    create() {
      const root = JSON.parse(JSON.stringify(this.tree.find(t => t.checked)))
      root.keys = root.keys.filter(k => k.checked)
      root.keys.map(k => ({
        id: k.id,
        name: k.name,
        readonly: k.readonly,
      }))
      const subItems = this.getSubItems(root)
      root.data = subItems
      console.log(root)
    },
    getSubItems(directory) {
      const subItems = directory.subItems.filter(i => i.checked)

      return subItems.map(c => {
        const items = this.getSubItems(c)
        const data = c.values
          ? c.values.map(r => ({
              id: r.id,
              data: r.data,
            }))
          : []
        return {
          dirId: c._id,
          name: c.name,
          subItems: items,
          values: data,
        }
      })
    },
  },
}
</script>

<template>
  <ContentBody>
    <template #header>
      <div>
        <span class="page-title">Создать редакцию</span>
        <div class="input-field">
          <label>Название</label>
          <input class="input" type="text" />
        </div>
      </div>
      <AppButton outlined @click="create">Создать</AppButton>
    </template>
    <template #content>
      <RootList :directories="tree" />
    </template>
  </ContentBody>
</template>
