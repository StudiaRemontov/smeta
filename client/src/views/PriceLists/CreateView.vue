<script>
import ContentBody from '@/components/Layout/App/ContentBody.vue'
import CreatePriceList from '@/components/PriceLists/Create/Modals/CreatePriceList.vue'
import TreeTable from 'primevue/treetable'
import SelectButton from 'primevue/selectbutton'
import MultiSelect from 'primevue/multiselect'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import priceListMixin from '@/mixins/priceList.mixin'
import expandAllMixin from '@/mixins/expandAll.mixin'
import { requiredKeys as outlayKeys } from '@/enum/outlayKeys'

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
  mixins: [priceListMixin, expandAllMixin],
  computed: {
    outlayKeys() {
      return outlayKeys
    },
    tooltipData() {
      const text = 'Редакция может быть создана из справочников с колонками:'
      return `${text} ${this.outlayKeys.join(', ')}`
    },
    tree() {
      if (!this.selectedRoot) return []
      const root = this.clonedDirectories.find(
        c => c._id === this.selectedRoot._id,
      )
      const tree = this.getSubItems(root)

      return [tree]
    },
    rootOptions() {
      const rootsForOutlay = this.roots.filter(root => {
        const { keys } = root
        return this.outlayKeys.every(key => keys.find(k => k.type === key))
      })
      return rootsForOutlay.map(r => ({ name: r.name, value: r._id }))
    },
  },
  watch: {
    selectedRoot() {
      this.selectedColumns = this.columns
      this.readOnlyColumns = this.columns
    },
  },
  mounted() {
    this.selectedColumns = this.columns
    this.readOnlyColumns = this.columns
  },
  methods: {
    changeRoot() {
      this.selectedValues = null
      this.selectedColumns = this.columns
      this.readOnlyColumns = this.columns
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
            <span>
              Корневой справочник
              <i
                v-tooltip.top="tooltipData"
                class="pi pi-question-circle"
                style="font-size: 16px"
              ></i>
            </span>
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
        :expandedKeys="expandedKeys"
        :scrollable="true"
        class="p-treetable-sm"
        :filters="filters"
        scrollHeight="flex"
        v-model:selectionKeys="selectedValues"
      >
        <template #header>
          <div class="table-header">
            <div class="table-header__row">
              <div class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <InputText
                  v-model="filters['global']"
                  @input="filterHandler"
                  placeholder="Глобальный поиск"
                />
              </div>
            </div>
            <div class="table-header__row">
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
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

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
