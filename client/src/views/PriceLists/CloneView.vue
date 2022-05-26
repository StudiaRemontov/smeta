<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import CreatePriceList from '@/components/PriceLists/Create/Modals/CreatePriceList.vue'
import EditableCell from '@/components/PriceLists/Clone/EditableCell.vue'
import TreeTable from 'primevue/treetable'
import MultiSelect from 'primevue/multiselect'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import { merge, mergeWith, isArray } from 'lodash'
import priceList from '@/mixins/priceList.mixin'
import keyTypes from '@/mixins/keyTypes.mixin'
import expandAllMixin from '@/mixins/expandAll.mixin'
import { isObjectId } from '@/helpers/isObjectId'

import { difference, differenceWith, isEqual } from 'lodash'

export default {
  components: {
    ContentBody,
    CreatePriceList,
    TreeTable,
    Column,
    MultiSelect,
    InputText,
    InputNumber,
    Dropdown,
    EditableCell,
  },
  mixins: [priceList, keyTypes, expandAllMixin],
  data() {
    return {
      selectedValues: null,
      selectedColumns: [],
      readOnlyColumns: [],
      name: '',
      tree: [],
      oldKeys: [],
      newKeys: [],
      differenceKeys: [],
      isMassiveChangeMode: false,
      selectedValuesBefore: null,
      listOfTreeValues: null,
      listOfTreeValuesInit: null,
      selectedKey: null,
      percent: 0,
      treeBefore: null,
      timeout: null,
      updatedFields: [],
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
    selectedRows() {
      if (!this.isMassiveChangeMode) {
        return []
      }
      const selected = Object.keys(this.selectedValues).filter(
        v => !isObjectId(v),
      )
      return this.listOfTreeValues.filter(v => selected.includes(v.key))
    },
    keysToEdit() {
      if (!this.selectedRoot) return []
      const keysWithType = this.selectedColumns.map(key => {
        const keyWithType = this.selectedRoot.keys.find(k => k.id === key.id)
        if (keyWithType) {
          const { type } = keyWithType
          return {
            ...key,
            type,
          }
        }
        return key
      })
      return keysWithType.filter(key => {
        if (key.readonly) {
          return false
        }
        return (
          key.type === this.InputType.NUMBER ||
          key.type === this.InputType.QUANTITY ||
          key.type === this.InputType.PRICE
        )
      })
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

    const globalItems = this.treeToList(
      JSON.parse(JSON.stringify(globalTree)),
      [],
    )
    const globalRows = globalItems.filter(i => typeof i === 'string')

    const currentTreeItems = this.treeToList(
      JSON.parse(JSON.stringify(treeData[0])),
      [],
    )
    const currentTreeRows = currentTreeItems.filter(i => typeof i === 'string')

    const oldKeys = difference(currentTreeRows, globalRows)
    const newestKeys = difference(globalRows, currentTreeRows)

    const merged =
      this.clone.mergeType === 'full'
        ? this.merge1(
            JSON.parse(JSON.stringify([globalTree])),
            JSON.parse(JSON.stringify(treeData)),
          )
        : this.merge2(
            JSON.parse(JSON.stringify([globalTree])),
            JSON.parse(JSON.stringify(treeData)),
          )

    const keys = JSON.parse(JSON.stringify(this.selectedEdition.keys))
    this.selectedColumns = keys.map((key, index) => ({
      ...key,
      id: key.id + '',
      expander: index === 0,
    }))
    this.readOnlyColumns = this.selectedColumns.filter(key => key.readonly)

    this.selectedValues = this.getSelectedValues(this.clone.value[0])

    this.tree = merged
    this.listOfTreeValues = this.treeToListOnlyValues(this.tree[0])
    this.listOfTreeValuesInit = JSON.parse(
      JSON.stringify(this.listOfTreeValues),
    )
    const fullOldest = new Set(this.getFullDifference(this.tree[0], oldKeys))
    const fullNewest = new Set(this.getFullDifference(this.tree[0], newestKeys))
    this.oldKeys = [...fullOldest]
    this.newKeys = [...fullNewest]
  },
  methods: {
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
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()
      if (isObjectId(key)) {
        return childs
      }
      return [...childs, node]
    },
    getFullDifference(node, keys) {
      const { children, key } = node
      const isDirectory = isObjectId(key)
      let differences = []
      if (isDirectory && keys.includes(node.key)) {
        differences = [...this.treeToList(node, [])]
      } else if (isDirectory && children.length > 0) {
        const childs = children.map(c => this.getFullDifference(c, keys)).flat()
        differences = [...childs]
      }
      if (!isDirectory) {
        if (keys.includes(key)) {
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
    resetMassiveChangeMode() {
      this.percent = null
      this.selectedValuesBefore = null
      this.isMassiveChangeMode = false
      this.treeBefore = null
      this.selectedKey = null
    },
    enableMassiveChangeMode() {
      this.isMassiveChangeMode = true
      this.selectedValuesBefore = JSON.parse(
        JSON.stringify(this.selectedValues),
      )
      this.listOfTreeValues = this.treeToListOnlyValues(this.tree[0])
      this.treeBefore = JSON.parse(JSON.stringify(this.tree))
      this.selectedValues = {}
    },
    cacnelMassiveChangeMode() {
      this.selectedValues = JSON.parse(
        JSON.stringify(this.selectedValuesBefore),
      )
      this.tree = this.treeBefore
      this.resetMassiveChangeMode()
    },
    updateValues(e) {
      if (this.timeout) {
        this.timeout = clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        const { value } = e
        this.selectedRows.forEach(row => {
          const itemBefore = this.listOfTreeValuesInit.find(
            v => v.key === row.key,
          )
          const valueBefore = itemBefore.data[this.selectedKey]
          const increaseValue = (valueBefore / 100) * value
          row.data[this.selectedKey] = +(valueBefore + increaseValue).toFixed(2)
        })
      }, 500)
    },
    applyChanges() {
      this.updatedFields = differenceWith(
        this.listOfTreeValues,
        this.listOfTreeValuesInit,
        (objValue, srcValue) => {
          return isEqual(objValue.data, srcValue.data)
        },
      )
      this.updatedFields = this.updatedFields.map(({ key }) => key)
      this.selectedValues = JSON.parse(
        JSON.stringify(this.selectedValuesBefore),
      )
      this.resetMassiveChangeMode()
    },
    onNodeSelect(node) {
      if (!this.isMassiveChangeMode || !this.selectedKey) {
        return
      }
      const isParent = isObjectId(node.key)
      if (!isParent) {
        const increaseValue = (node.data[this.selectedKey] / 100) * this.percent
        node.data[this.selectedKey] = +(
          node.data[this.selectedKey] + increaseValue
        ).toFixed(2)
        return
      }
      const items = this.treeToListOnlyValues(node)
      return items.forEach(item => {
        const itemBefore = this.listOfTreeValuesInit.find(
          v => v.key === item.key,
        )
        const valueBefore = itemBefore.data[this.selectedKey]

        const increaseValue = (valueBefore / 100) * this.percent
        item.data[this.selectedKey] = +(valueBefore + increaseValue).toFixed(2)
      })
    },
    onNodeUnselect(node) {
      if (!this.isMassiveChangeMode) {
        return
      }

      const isParent = isObjectId(node.key)
      if (!isParent) {
        const itemBefore = this.listOfTreeValuesInit.find(
          v => v.key === node.key,
        )
        const valueBefore = itemBefore.data[this.selectedKey]
        node.data[this.selectedKey] = valueBefore
        return
      }
      const items = this.treeToListOnlyValues(node)
      return items.forEach(item => {
        const itemBefore = this.listOfTreeValuesInit.find(
          v => v.key === item.key,
        )
        const valueBefore = itemBefore.data[this.selectedKey]
        item.data[this.selectedKey] = valueBefore
      })
    },
    editableCellUpdateHandler() {
      if (this.timeout) {
        this.timeout = clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        const listOfVals = this.treeToListOnlyValues(this.tree[0])
        this.updatedFields = differenceWith(
          listOfVals,
          this.listOfTreeValuesInit,
          (objValue, srcValue) => {
            return isEqual(objValue.data, srcValue.data)
          },
        )

        this.updatedFields = this.updatedFields.map(({ key }) => key)
      }, 500)
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
            <template v-if="!isMassiveChangeMode">
              <AppButton outlined @click="enableMassiveChangeMode">
                Массовое изменение
              </AppButton>
              <AppButton outlined @click="setClone(null)">Отмена</AppButton>
              <AppButton outlined @click="createHandler">Сохранить</AppButton>
            </template>
            <template v-else>
              <template v-if="selectedRows.length === 0">
                <span class="header__message">Выберите значения</span>
              </template>
              <template v-else-if="selectedKey">
                <InputNumber
                  v-model="percent"
                  suffix=" %"
                  placeholder="Процент"
                  :minFractionDigits="2"
                  @input="updateValues"
                />
              </template>
              <Dropdown
                v-model="selectedKey"
                :options="keysToEdit"
                placeholder="Выберите ключ"
                optionLabel="name"
                optionValue="id"
              />
              <AppButton outlined @click="applyChanges">
                Применить изменения
              </AppButton>
              <AppButton outlined @click="cacnelMassiveChangeMode">
                Отмена
              </AppButton>
            </template>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <CreatePriceList ref="create-priceList" />
      <TreeTable
        v-if="tree"
        v-model:selectionKeys="selectedValues"
        :value="tree"
        selectionMode="checkbox"
        :expandedKeys="expandedKeys"
        :scrollable="true"
        :filters="filters"
        scrollHeight="flex"
        class="p-treetable-sm"
        @nodeSelect="onNodeSelect"
        @nodeUnselect="onNodeUnselect"
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
              :class="[
                {
                  neutral:
                    oldKeys.includes(node.key) && newKeys.includes(node.key),
                },
                { oldest: oldKeys.includes(node.key) },
                { newest: newKeys.includes(node.key) },
              ]"
            >
              <span v-if="node.children.length > 0" class="bold">
                {{ node.data[col.id] }}
              </span>
              <template v-else-if="!col.readonly && col.id in node.data">
                <EditableCell
                  v-model="node.data[col.id]"
                  @update:modelValue="editableCellUpdateHandler"
                  :root="selectedRoot"
                  :field="col.id"
                  :style="col.expander && 'width: 100%'"
                  :updated="updatedFields?.includes(node.key)"
                  :disabled="isMassiveChangeMode"
                />
              </template>
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

  &__message {
    display: flex;
    justify-content: center;
    align-items: center;
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

.oldest:not(.neutral) {
  color: #ff1700;

  .input {
    color: inherit;
  }
}

.newest:not(.neutral) {
  color: #22c55e;

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
