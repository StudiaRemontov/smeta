<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import CreatePriceList from '@/components/PriceLists/Create/Modals/CreatePriceList.vue'
import TreeTable from 'primevue/treetable'
import MultiSelect from 'primevue/multiselect'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { merge, mergeWith, isArray } from 'lodash'
import { diff } from 'deep-object-diff'
import priceList from '@/mixins/priceList.mixin'

export default {
  components: {
    ContentBody,
    CreatePriceList,
    TreeTable,
    Column,
    MultiSelect,
    InputText,
  },
  mixins: [priceList],
  data() {
    return {
      selectedValues: null,
      selectedColumns: [],
      readOnlyColumns: [],
      name: '',
      tree: [],
      differenceKeys: [],
      filters: {},
    }
  },
  computed: {
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
    if (!this.selectedRoot || !this.clone) {
      this.tree = []
    }
    const globalTree = JSON.parse(
      JSON.stringify(this.getSubItems(this.selectedRoot)),
    )

    const tree = this.clone.value
    const treeData = JSON.parse(JSON.stringify(tree))
    const differ = diff(globalTree, treeData[0])

    this.differenceKeys = this.getKeys(differ)

    const merged =
      this.clone.mergeType === 'full'
        ? this.merge1([globalTree], treeData)
        : this.merge2([globalTree], treeData)

    const keys = JSON.parse(JSON.stringify(this.selectedEdition.keys))
    this.selectedColumns = keys.map((key, index) => ({
      ...key,
      id: key.id + '',
      expander: index === 0,
    }))
    this.readOnlyColumns = this.selectedColumns.filter(key => key.readonly)
    this.selectedValues = this.getSelectedValues(this.clone.value[0])
    this.tree = merged
    const fullDifference = new Set(this.getFullDifference(this.tree[0]))
    this.differenceKeys = [...fullDifference]
  },
  methods: {
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    getKeys(node) {
      if (node?.key) {
        return [node.key]
      }

      if (node?.children) {
        return Object.values(node.children).map(this.getKeys).flat()
      }
      return []
    },
    treeToList(node, list) {
      const { key, children } = node
      if (children && children.length > 0) {
        if (key)
          return [
            node,
            ...node.children.map(c => this.treeToList(c, list)).flat(),
          ]
      }
      return [...list, node.key]
    },
    getFullDifference(node) {
      const { children, key } = node
      const isDirectory = this.isObjectId(key)
      let differences = []
      if (isDirectory && this.differenceKeys.includes(node.key)) {
        differences = [...this.treeToList(node, [])]
      } else if (isDirectory && children.length > 0) {
        const childs = children.map(this.getFullDifference).flat()
        differences = [...childs]
      }
      if (!isDirectory) {
        if (this.differenceKeys.includes(key)) {
          differences.push(key)
        }
      }

      if (differences.length > 0) {
        return [key, ...differences]
      }
      return []
    },
    getSelectedValues(node) {
      const value = {
        [node.key]: {
          checked: true,
        },
      }
      let children = []
      if (node.children && node.children.length > 0) {
        children = node.children.reduce((acc, c) => {
          const val = this.getSelectedValues(c)
          acc = {
            ...acc,
            ...val,
          }
          return acc
        }, {})
      }
      return { ...value, ...children }
    },
    merge1(obj1, obj2) {
      return merge(obj1, obj2)
    },
    merge2(obj1, obj2) {
      return mergeWith(obj1, obj2, (objValue, srcValue) => {
        if (isArray(objValue)) {
          srcValue = srcValue.filter(row => {
            return !!objValue.find(({ key }) => +row.key === key)
          })

          return merge(objValue, srcValue)
        }
      })
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
            <AppButton outlined @click="setClone(null)">Отмена</AppButton>
            <AppButton outlined @click="createHandler">Сохранить</AppButton>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <CreatePriceList ref="create-priceList" />
      <TreeTable
        v-if="tree"
        :value="tree"
        selectionMode="checkbox"
        :scrollable="true"
        :filters="filters"
        scrollHeight="flex"
        class="p-treetable-sm"
        v-model:selectionKeys="selectedValues"
      >
        <template #header>
          <div class="table-header">
            <div class="table-header__row">
              <div class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <InputText
                  v-model="filters['global']"
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
            <div
              class="wrapper"
              :class="{ newest: differenceKeys.includes(node.key) }"
            >
              <span
                v-if="col.readonly && node.children.length > 0"
                class="bold"
              >
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
            </div>
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

.bold {
  font-weight: 600;
}

.newest {
  color: #ff1700;

  .input {
    color: inherit;
  }
}

.input {
  max-width: fit-content;
  width: 70%;
  border: none;
  outline: none;
  border-bottom: 1px black solid;
}
.wrapper {
  vertical-align: middle;
  display: block;
  width: 100%;
}
</style>
