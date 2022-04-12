<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ContentBody from '@/components/Layout/ContentBody.vue'
import keyTypes from '@/mixins/keyTypes.mixin'
import rootGetters from '@/mixins/rootGetters.mixin'

import DirectoryItem from '@/components/PriceLists/Create/DirectoryItem.vue'

export default {
  components: {
    DirectoryItem,
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
    ...mapMutations('edition', ['setClonedDirectories', 'setSelectedValues']),
    ...mapActions('edition', ['setSubItems', 'create']),
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
    async createEdition() {
      if (!this.selectedRoot || !this.name) return
      const root = JSON.parse(JSON.stringify(this.selectedRoot))
      // eslint-disable-next-line no-unused-vars
      const { _id, ...edition } = root
      edition.keys = edition.keys.filter(k => k.checked)
      edition.keys = edition.keys.map(key => ({
        id: key.id,
        name: key.name,
        readonly: key.readonly,
      }))
      const subItems = this.getSubItems(edition)
      edition.data = subItems
      edition.name = this.name
      try {
        await this.create(edition)
        this.$router.push('/pricelists')
      } catch (error) {
        console.log(error)
      }
    },
    getSubItems(directory) {
      const { subItems, values } = directory
      if (values) {
        const data = directory.selectedValues.map(r => ({
          id: r.id,
          data: r.data,
        }))
        return {
          dirId: directory._id,
          name: directory.name,
          values: data,
        }
      }
      if (!subItems) return []

      const items = subItems.map(c => {
        return this.getSubItems(c)
      })
      return {
        dirId: directory._id,
        name: directory.name,
        subItems: items,
      }
    },
    checkHandler(value) {
      //Если предыдущий root был, то предыдущий root отчистить
      //отчистка: если root с values - все values unchecked
      // если root с subItems - selectedItems = []
      if (this.selectedRoot) {
        const { values, subItems } = this.selectedRoot
        if (values) {
          this.setSelectedValues({
            id: this.selectedRoot._id,
            value: [],
          })
        }
        if (subItems?.length > 0) {
          this.setSubItems({
            id: this.selectedRoot._id,
            value: [],
          })
        }
      }
      //Если value и предыдущий root был null - если текущий с values - все values checked
      if (value) {
        const { values } = value
        if (values) {
          this.setSelectedValues({
            id: value._id,
            value: values,
          })
        }
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
          <input v-model="name" class="input" type="text" />
        </div>
      </div>
      <AppButton outlined @click="createEdition">Создать</AppButton>
    </template>
    <template #content>
      <DirectoryItem
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
