<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import CreatePriceList from '@/components/PriceLists/Create/Modals/CreatePriceList.vue'
import TreeTable from 'primevue/treetable'
import SelectButton from 'primevue/selectbutton'
import MultiSelect from 'primevue/multiselect'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import rootGetters from '@/mixins/rootGetters.mixin'
import keyTypes from '@/mixins/keyTypes.mixin'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ContentBody,
    CreatePriceList,
    TreeTable,
    Column,
    SelectButton,
    MultiSelect,
    InputText,
  },
  mixins: [rootGetters, keyTypes],
  data() {
    return {
      selectedValues: null,
      rootId: null,
      selectedColumns: [],
      readOnlyColumns: [],
      name: '',
    }
  },
  computed: {
    ...mapGetters('directory', ['roots', 'directories']),
    ...mapGetters('edition', ['clonedDirectories', 'editions']),
    ...mapGetters('priceList', ['selectedPriceList']),
    selectedRoot() {
      if (!this.rootId && !this.selectedPriceList) return null
      const editionId =
        this.selectedPriceList && this.selectedPriceList.editions[0]

      const root = editionId && this.editions.find(e => e._id === editionId)
      const rootId = root ? root.dirId : this.rootId
      return this.roots.find(r => r._id === rootId)
    },
    columns() {
      if (!this.selectedRoot) return []

      return this.selectedRoot.keys.map((key, index) => ({
        ...key,
        id: key.id + '',
        expander: index === 0,
        editable: index === 2,
      }))
    },
    tree() {
      if (!this.selectedRoot) return []
      const tree = this.getSubItems(this.selectedRoot)
      return tree.children
    },
    rootOptions() {
      return this.roots.map(r => ({ name: r.name, value: r._id }))
    },
  },
  watch: {
    selectedRoot() {
      this.selectedColumns = this.columns
      this.readOnlyColumns = this.columns
    },
  },
  mounted() {
    const clone = JSON.parse(JSON.stringify(this.directories))
    const clonedDirectories = clone.map(dir => {
      const { values } = dir
      if (!values) {
        return dir
      }
      const root = this.getRoot(dir._id)
      const { keys } = root
      const keysTypeSelect = keys.filter(k => k.type === this.InputType.SELECT)
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

      return dir
    })
    this.setClonedDirectories(clonedDirectories)
  },
  methods: {
    ...mapMutations('edition', ['setClonedDirectories']),
    ...mapActions('edition', ['create']),
    changeRoot() {
      this.selectedValues = null
      this.selectedColumns = this.columns
      this.readOnlyColumns = this.columns
    },
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
    getSubItems(directory) {
      const children = this.clonedDirectories.filter(
        d => d?.parent === directory._id,
      )
      const { values } = directory

      const subChildren = values
        ? values.map(n => ({
            key: n.id,
            data: n.data,
            children: [],
          }))
        : children.map(c => this.getSubItems(c))
      const data = { [this.columns[0].id]: directory.name }
      return {
        key: directory._id,
        data,
        children: subChildren,
      }
    },
    prepareData(directory, folders, valueIds) {
      const data = {
        dirId: directory._id,
        name: directory.name,
        subItems: [],
      }
      const children = folders.filter(d => d?.parent === directory._id)
      if (children.length > 0) {
        data.subItems = children.map(c =>
          this.prepareData(c, folders, valueIds),
        )
      }
      const { values } = directory
      if (values) {
        const newValues = values.filter(row => {
          return valueIds.includes(row.id + '')
        })
        data.values = newValues
      }

      return data
    },
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    async createHandler() {
      if (!this.rootId || !this.selectedValues || !this.name) {
        return
      }
      if (
        this.selectedColumns.length === 0 ||
        Object.keys(this.selectedValues).length === 0
      ) {
        return
      }
      if (!this.selectedPriceList) {
        const response = await this.$refs['create-priceList'].show({
          title: 'Создать прайс лист',
          okButton: 'Создать',
          cancelButton: 'Отмена',
        })
        console.log(response)

        if (!response) {
          return
        }
      }
      const keys = this.selectedColumns.map(k => {
        const readonly = !!this.readOnlyColumns.find(c => c.id === k.id)

        return {
          id: k.id,
          name: k.name,
          readonly,
        }
      })

      const valueIds = []
      const folderIds = Object.keys(this.selectedValues).filter(k => {
        const isObjectId = this.isObjectId(k)
        if (!isObjectId) {
          valueIds.push(k)
        }
        return isObjectId
      })
      const folders = this.clonedDirectories.filter(f => {
        return folderIds.includes(f._id)
      })
      const parents = folders.filter(f => {
        const { values } = f
        if (!values) {
          return true
        }
      })

      const data = parents.map(p => this.prepareData(p, folders, valueIds))
      const edition = {
        keys,
        data,
        dirId: this.selectedRoot._id,
        name: this.name,
      }

      try {
        await this.create(edition)
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <ContentBody>
    <template #header>
      <div class="header">
        <div class="header__row">
          <InputText v-model="name" placeholder="Название редакции" />
          <AppButton outlined @click="createHandler">Создать</AppButton>
        </div>
        <div class="select">
          <div v-if="!selectedPriceList" class="header__row">
            <span> Корневой справочник </span>
            <SelectButton
              v-model="rootId"
              :options="rootOptions"
              @change="changeRoot"
              optionLabel="name"
              optionValue="value"
            ></SelectButton>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <CreatePriceList ref="create-priceList" />
      <TreeTable
        v-if="selectedRoot"
        :value="tree"
        selectionMode="checkbox"
        :scrollable="true"
        scrollHeight="flex"
        v-model:selectionKeys="selectedValues"
      >
        <template #header>
          <div class="table-header">
            <div class="table-header__multiselect">
              <span> Отображаемые колнки </span>
              <MultiSelect
                v-model="selectedColumns"
                :options="columns"
                optionLabel="name"
                placeholder="Выберите колонки"
                style="width: 20em"
              />
            </div>
            <div class="table-header__multiselect">
              <span> Колонки для чтения </span>
              <MultiSelect
                v-model="readOnlyColumns"
                :options="columns"
                optionLabel="name"
                placeholder="Выберите колонки"
                style="width: 20em"
              />
            </div>
          </div>
        </template>
        <Column
          v-for="col in selectedColumns"
          :key="col.id"
          :field="col.id"
          :header="col.name"
          :expander="col.expander"
          :class="{ first: col.expander }"
        >
          <!-- <template #body="{ node }" v-if="col.editable">
            <input :value="node.data[col.id]" />
          </template> -->
        </Column>
      </TreeTable>
    </template>
  </ContentBody>
</template>

<style lang="scss">
.header {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__multiselect {
    display: flex;
    gap: 5px;
    flex-direction: column;
  }
}

.first {
  min-width: 500px;
}
.p-treetable table {
  table-layout: auto;
}

.select {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.p-treetable-wrapper {
  @include darkScroll;
}
</style>
