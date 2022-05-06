<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import KeyModal from './Modals/KeyModal.vue'
import keyTypes from '@/mixins/keyTypes.mixin'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

import TableCell from './Table/TableCell.vue'
import CellBody from './Table/CellBody.vue'

export default {
  components: {
    KeyModal,
    DataTable,
    Column,
    Button,
    TableCell,
    CellBody,
  },
  mixins: [keyTypes],
  props: {
    values: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapGetters('directory', ['root']),
    directoryId() {
      return this.$route.params.id
    },
    allKeys() {
      return this.root?.keys.map(k => ({
        ...k,
        id: k.id + '',
      }))
    },
    eidtableKeys() {
      return this.root?.keys.filter(k => k.type !== this.InputType.COUNTER)
    },
    counter() {
      return this.root?.keys.find(k => k.type === this.InputType.COUNTER)
    },
    data() {
      if (!this.values?.length) {
        return []
      }
      return this.values.map(r => r.data)
    },
  },
  watch: {
    directoryId(newval, old) {
      if (!old) return
      this.removeEmptyRows({ id: old })
    },
  },
  methods: {
    ...mapMutations('directory', ['removeEmptyRows', 'setLoading']),
    ...mapActions('directory', [
      'updateDirectoryKeys',
      'updateDirectoryValues',
      'createTableRow',
      'updateAllValuesInsideRoot',
    ]),
    updateKey(key, value) {
      const keys = this.allKeys.map(item => {
        if (item.id === key) {
          return {
            ...item,
            ...value,
          }
        }
        return item
      })

      this.updateArchitecture(keys)
    },
    updateValue(rowIndex, key, value) {
      const newValues = JSON.parse(JSON.stringify(this.values))
      const values = newValues.map((row, index) => {
        if (index === rowIndex) {
          row.data[key] = value
        }
        return row
      })
      this.updateValues(values)
    },
    async openKeyModal() {
      const response = await this.$refs['key-modal'].show({
        title: 'Добавить колонку',
        okButton: 'Добавить',
        cancelButton: 'Отмена',
      })
      if (!response) {
        return
      }
      const newKey = {
        id: Date.now() + '',
        ...response,
      }
      const keys = [...this.allKeys, newKey]
      if (response.type === this.InputType.PRICE) {
        const quantityKey = {
          id: Date.now() + 1 + '',
          name: 'Количество',
          type: this.InputType.QUANTITY,
        }
        keys.push(quantityKey)
        // await this.updateAllValuesInsideRoot({ rootId: this.root._id })
        // update all values inside root
      } else if (response.type === this.InputType.QUANTITY) {
        // update all values inside root
        const newValues = this.values.map(row => {
          row.data[newKey.id] = 0
          return row
        })
        this.updateValues(newValues)
      }

      this.updateArchitecture(keys)
    },
    async openEditModal(key) {
      const keyToEdit = this.allKeys.find(k => k.id === key)
      const response = await this.$refs['key-modal'].show({
        title: 'Изменить колонку',
        okButton: 'Сохранить',
        cancelButton: 'Отмена',
        key: keyToEdit,
      })
      if (!response) {
        return
      }
      if (response.remove) {
        return this.removeKey(key)
      }

      this.updateKey(key, response)
    },
    async removeKey(keyId) {
      const keys = this.allKeys.filter(({ id }) => id !== keyId)

      if (keys.length === 0) {
        await this.updateValues([])
        return this.updateArchitecture([])
      }
      const values = this.values.map(row => {
        const data = Object.entries(row.data).reduce((acc, [key, value]) => {
          if (key !== keyId) {
            acc[key] = value
          }
          return acc
        }, {})

        return {
          ...row,
          data,
        }
      })
      this.updateArchitecture(keys)
      this.updateValues(values)
    },
    removeRow(rowIndex) {
      const values = this.values.filter((_, index) => index !== rowIndex)
      this.updateValues(values)
    },
    async createRow() {
      this.createTableRow(this.directoryId)
      await this.$nextTick()
      const { table } = this.$refs
      const rows = table.$el.querySelectorAll('.p-editable-column')
      const rowsLength = rows.length
      const keysLength = this.allKeys.length
      const firstCellOfLastRow = rows[rowsLength - keysLength]
      setTimeout(() => {
        firstCellOfLastRow?.click()
      })
    },
    async updateValues(values) {
      this.setLoading(true)
      try {
        await this.updateDirectoryValues({ id: this.directoryId, values })
        this.setLoading(false)
      } catch (error) {
        console.log(error)
      }
    },
    async updateArchitecture(keys) {
      try {
        await this.updateDirectoryKeys(keys)
      } catch (error) {
        console.log(error)
      }
    },
    getTypeOfField(keyId) {
      const key = this.eidtableKeys.find(k => k.id === keyId)
      return key?.type
    },
    editComplete(event) {
      setTimeout(() => {
        const { newData, field, index } = event
        if (this.data[index][field] === newData[field]) {
          this.setLoading(false)
          return
        }
        this.updateValue(index, field, newData[field])
      })
    },
  },
}
</script>

<template>
  <KeyModal ref="key-modal" />
  <DataTable
    ref="table"
    :value="data"
    :resizableColumns="true"
    edit-mode="cell"
    showGridlines
    :scrollable="true"
    scrollHeight="flex"
    @cell-edit-complete="editComplete"
  >
    <template #header v-if="allKeys && allKeys.length > 0">
      <div class="table-header">
        <Button @click="createRow">Добавить элемент</Button>
      </div>
    </template>
    <Column v-if="counter" :field="counter.id" :header="counter.name">
      <template #header>
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-text"
          @click="openEditModal(counter.id)"
        />
      </template>
      <template #body="{ index }">
        {{ index + 1 }}
      </template>
    </Column>
    <Column
      v-for="key in eidtableKeys"
      :key="key.id"
      :field="key.id"
      :header="key.name"
      class="column"
    >
      <template #editor="{ data, field, index }">
        <TableCell v-model="data[field]" :field="field" :rowIndex="index" />
      </template>
      <template #header="{ column }">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-text"
          @click="openEditModal(column.key)"
        />
      </template>
      <template #body="{ data, field }">
        <CellBody :value="data[field]" :field="field" />
      </template>
    </Column>
    <Column field="create" class="create-cell">
      <template #header>
        <Button
          label="Добавить колонку"
          @click="openKeyModal"
          icon="pi pi-plus"
        />
      </template>
      <template #body="{ index }">
        <Button
          icon="pi pi-trash"
          class="p-button-rounded p-button-danger"
          @click="removeRow(index)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<style lang="scss" scoped>
.table {
  &-header {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}
</style>

<style lang="scss">
.delete-cell {
  max-width: 100px;
  min-width: 100px;
  display: flex;
  justify-content: center;
}
.p-datatable-wrapper {
  @include darkScroll;
}

.p-datatable .p-column-header-content {
  flex-direction: row-reverse;
  gap: 10px;
}

.create-cell {
  min-width: 100px;
  display: flex;
  justify-content: center;
}
</style>
