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
    keys() {
      return this.root?.keys.map(k => ({
        ...k,
        id: k.id + '',
      }))
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
    ...mapMutations('directory', ['removeEmptyRows']),
    ...mapActions('directory', [
      'updateDirectoryKeys',
      'updateDirectoryValues',
      'createTableRow',
    ]),
    updateKey(key, value) {
      const keys = this.keys.map(item => {
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
      const keys = [...this.keys, { id: Date.now() + '', ...response }]

      this.updateArchitecture(keys)
    },
    async openEditModal(key) {
      const keyToEdit = this.keys.find(k => k.id === key)
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
      const keys = this.keys.filter(({ id }) => id !== keyId)

      if (keys.length === 0) {
        await this.updateValues([])
        return this.updateArchitecture([])
      }
      const values = this.values.map(row => {
        return Object.entries(row).reduce((acc, [key, value]) => {
          if (+key !== keyId) {
            acc[key] = value
          }
          return acc
        }, {})
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
      const rows = document.querySelectorAll('.p-editable-column')
      const rowsLength = rows.length
      const keysLength = this.keys.length
      const firstCellOfLastRow = rows[rowsLength - keysLength]
      setTimeout(() => {
        firstCellOfLastRow.click()
      })
    },
    async updateValues(values) {
      try {
        await this.updateDirectoryValues({ id: this.directoryId, values })
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
      const key = this.keys.find(k => k.id === keyId)
      return key?.type
    },
    editComplete(event) {
      const { newData, field, index, newValue, value } = event
      if (newValue === value) {
        return
      }
      setTimeout(() => {
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
    <template #header>
      <div class="table-header">
        <Button @click="createRow">Добавить элемент</Button>
      </div>
    </template>
    <Column
      v-for="key in keys"
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
        <Button @click="openKeyModal">
          <i class="pi pi-plus"></i>
        </Button>
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
