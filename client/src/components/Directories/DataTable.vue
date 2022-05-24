<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import KeyModal from './Modals/KeyModal.vue'
import keyTypes from '@/mixins/keyTypes.mixin'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

import TableCell from './Table/TableCell.vue'

export default {
  components: {
    KeyModal,
    DataTable,
    Column,
    Button,
    TableCell,
  },
  mixins: [keyTypes],
  props: {
    directory: {
      type: Object,
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
      if (!this.tableData?.length) {
        return []
      }
      return this.tableData.map(r => r.data)
    },
    values() {
      return this.directory.values
    },
    tableData() {
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
    ...mapMutations('directory', [
      'removeEmptyRows',
      'setLoading',
      'updateDirectory',
    ]),
    ...mapActions('directory', [
      'createTableRow',
      'updateValues',
      'createKey',
      'removeKey',
      'updateKey',
    ]),
    async createRow() {
      this.createTableRow(this.directoryId)
    },
    removeRow(rowIndex) {
      const values = this.values.filter((_, index) => index !== rowIndex)
      this.updateValues({
        id: this.directoryId,
        values,
      })
    },
    async change(index, field, value) {
      try {
        const tableData = JSON.parse(JSON.stringify(this.values))
        const values = tableData.map((row, rowIndex) => {
          if (rowIndex === index) {
            row.data[field] = value
          }
          return row
        })
        await this.updateValues({
          id: this.directoryId,
          values,
        })
      } catch (error) {
        this.updateDirectory({ id: this.directory._id, data: this.directory })
      }
    },
    async createKeyHandler() {
      const response = await this.$refs['key-modal'].show({
        title: 'Добавить колонку',
        okButton: 'Добавить',
        cancelButton: 'Отмена',
      })
      if (!response) return

      this.createKey(response)
    },
    async editKey(id) {
      const keyToEdit = this.allKeys.find(k => k.id === id)
      const response = await this.$refs['key-modal'].show({
        title: 'Изменить колонку',
        okButton: 'Сохранить',
        cancelButton: 'Отмена',
        key: keyToEdit,
      })
      if (!response) return
      try {
        if (response.remove) {
          return await this.removeKey(id)
        }
        await this.updateKey({
          id,
          newKey: response,
        })
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <KeyModal ref="key-modal" />
  <DataTable
    ref="table"
    :value="tableData"
    :resizableColumns="true"
    showGridlines
    :scrollable="true"
    scrollHeight="flex"
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
          @click="editKey(counter.id)"
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
      <template #header="{ column }">
        <Button
          icon="pi pi-pencil"
          class="p-button-rounded p-button-text"
          @click="editKey(column.key)"
        />
      </template>
      <template #body="{ data, field, index }">
        <TableCell
          :value="data[field]"
          :field="field"
          :rowIndex="index"
          @change="change"
        />
      </template>
    </Column>
    <Column field="create" class="create-cell">
      <template #header>
        <Button
          label="Добавить колонку"
          @click="createKeyHandler"
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
