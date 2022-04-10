<script>
import { mapGetters, mapMutations } from 'vuex'
import ContentBody from '@/components/Layout/ContentBody.vue'
import keyTypes from '@/mixins/keyTypes.mixin'
import rootGetters from '@/mixins/rootGetters.mixin'

import RootItem from '@/components/PriceLists/Create/RootItem.vue'

export default {
  components: {
    RootItem,
    ContentBody,
  },
  mixins: [keyTypes, rootGetters],
  data() {
    return {
      name: '',
      selectedRoot: null,
    }
  },
  computed: {
    ...mapGetters('edition', ['clonedDirectories']),
    ...mapGetters('directory', ['directories', 'roots']),
    rootDirs() {
      return this.clonedDirectories.filter(d => !d.parent)
    },
  },
  mounted() {
    const clone = JSON.parse(JSON.stringify(this.directories))
    const clonedDirectories = clone.map(dir => {
      const { values } = dir
      if (!values) {
        dir.subItems = []
        return dir
      }
      if (values) {
        const root = this.getRoot(dir._id)
        const { keys } = root
        const keysTypeSelect = keys.filter(
          k => k.type === this.InputType.SELECT,
        )
        dir.values = values.map(row => {
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

      return dir
    })
    this.setClonedDirectories(clonedDirectories)
  },
  methods: {
    ...mapMutations('edition', ['setClonedDirectories', 'setSubItems']),
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
    checkHandler(value) {
      if (this.selectedRoot) {
        this.setSubItems({ id: this.selectedRoot._id, value: [] })
      }
      this.selectedRoot = value
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
      <RootItem
        v-for="root in rootDirs"
        :directory="root"
        :key="root._id"
        :root="root._id"
        :value="selectedRoot"
        @checked="checkHandler"
      />
    </template>
  </ContentBody>
</template>
