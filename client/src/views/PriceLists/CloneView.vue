<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import CreatePriceList from '@/components/PriceLists/Create/Modals/CreatePriceList.vue'
import TreeTable from 'primevue/treetable'
import MultiSelect from 'primevue/multiselect'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ContentBody,
    CreatePriceList,
    TreeTable,
    Column,
    MultiSelect,
    InputText,
  },
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
    ...mapGetters('edition', [
      'clonedDirectories',
      'editions',
      'clone',
      'selectedEdition',
    ]),
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
      if (!this.selectedEdition) return []

      return this.selectedEdition.keys.map((key, index) => ({
        ...key,
        id: key.id + '',
        expander: index === 0,
      }))
    },
  },
  mounted() {
    this.getTreeTableValue()
  },
  methods: {
    ...mapMutations('edition', ['setClonedDirectories', 'setClone']),
    ...mapActions('edition', ['create']),
    getTreeTableValue() {},
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
    multiSelectChangeHandler() {
      this.readOnlyColumns = this.selectedColumns.map(c => {
        return this.columns.find(col => col.id === c.id)
      })
    },
    async createHandler() {
      if (!this.selectedRoot || !this.selectedValues || !this.name) {
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
        if (k === this.selectedRoot._id) {
          return false
        }
        const isObjectId = this.isObjectId(k)
        if (!isObjectId) {
          valueIds.push(k)
        }
        return isObjectId
      })

      const folders = this.clonedDirectories.filter(f => {
        return folderIds.includes(f._id)
      })

      const data = this.prepareData(this.selectedRoot, folders, valueIds)
      console.log(data)

      const edition = {
        keys,
        data,
        dirId: this.selectedRoot._id,
        name: this.name,
      }

      try {
        await this.create(edition)
        this.setClone(null)
        this.$router.push('/pricelists')
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
          <div class="header__actions">
            <AppButton outlined @click="setCloned(null)">Отмена</AppButton>
            <AppButton outlined @click="createHandler">Сохранить</AppButton>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <CreatePriceList ref="create-priceList" />
      <TreeTable
        v-if="selectedRoot"
        :value="clone"
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
                @change="multiSelectChangeHandler"
                :options="columns"
                optionLabel="name"
                placeholder="Выберите колонки"
              />
            </div>
            <div class="table-header__multiselect">
              <span> Колонки для чтения </span>
              <MultiSelect
                v-model="readOnlyColumns"
                :options="selectedColumns"
                optionLabel="name"
                placeholder="Выберите колонки"
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
          <template #body="{ node }">
            <span v-if="col.readonly && node.children.length > 0" class="bold">
              {{ node.data[col.id] }}
            </span>
            <input
              v-else-if="!col.readonly && col.id in node.data"
              v-model="node.data[col.id]"
              type="text"
              class="input"
            />
            <span v-else>
              {{ node.data[col.id] }}
            </span>
          </template>
        </Column>
      </TreeTable>
    </template>
  </ContentBody>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__actions {
    display: flex;
    gap: 10px;
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

.p-treetable table {
  table-layout: auto;
}

.select {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bold {
  font-weight: 600;
}

.input {
  max-width: 100%;
  width: 100%;
}
</style>
