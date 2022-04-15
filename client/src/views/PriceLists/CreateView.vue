<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import CreatePriceList from '@/components/PriceLists/Create/Modals/CreatePriceList.vue'
import TreeTable from 'primevue/treetable'
import SelectButton from 'primevue/selectbutton'
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
    SelectButton,
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
      return [tree]
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
  methods: {
    ...mapMutations('edition', ['setClonedDirectories']),
    ...mapActions('edition', ['create']),
    changeRoot() {
      this.selectedValues = null
      this.selectedColumns = this.columns
      this.readOnlyColumns = this.columns
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
    convertData(node) {
      const { children } = node
      if (children && children.length > 0) {
        node.children = children.filter(c => this.selectedValues[c.key])
        node.children = node.children.map(this.convertData)
      }
      return node
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

      const data = this.convertData(JSON.parse(JSON.stringify(this.tree[0])))
      const edition = {
        keys,
        data,
        dirId: this.selectedRoot._id,
        name: this.name,
      }

      try {
        await this.create(edition)
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
        class="p-treetable-sm"
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
                style="width: 20em"
              />
            </div>
            <div class="table-header__multiselect">
              <span> Колонки для чтения </span>
              <MultiSelect
                v-model="readOnlyColumns"
                :options="selectedColumns"
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
          :class="col.expander ? 'first' : 'secondary'"
        >
          <template #body="{ node }">
            <span :class="{ bold: node.children.length > 0 }">
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

.p-treetable-toggler + .p-checkbox + span {
  vertical-align: middle;
  display: block;
  width: 100%;
}
</style>
