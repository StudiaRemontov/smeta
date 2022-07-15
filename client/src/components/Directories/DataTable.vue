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
    ...mapGetters('edition', ['editions']),
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
      return this.directory.values.filter(r => !r.removed)
    },
    tableData() {
      return this.values.map(r => r.data)
    },
    isArchirectureInUse() {
      return this.editions.find(e => e.dirId === this.root?._id)
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
      const values = this.values.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, removed: true }
        }
        return row
      })
      this.updateValues({
        id: this.directoryId,
        values,
      })
    },
    insertAfter(index, newItem) {
      const newValues = [
        ...this.values.slice(0, index),
        {
          id: Date.now() + '',
          data: newItem,
        },
        ...this.values.slice(index),
      ]
      return newValues
    },
    cloneRow(node, rowIndex) {
      const clone = JSON.parse(JSON.stringify(node))
      const values = this.insertAfter(rowIndex + 1, clone)
      this.updateValues({
        id: this.directoryId,
        values,
      })
    },
    getKeysToEdit(index, field, value) {
      /* метод должен вернить массив ключей, которые нужно изменить 
        [{
          key: key_id,
          value: value
        }]
      */
      const keysToUpdate = []
      const keyToEdit = this.allKeys.find(k => k.id === field)
      if (!keyToEdit) {
        return keysToUpdate
      }
      /*
        1) Если поле с типом Указывается параметры поменялось на false,
        то полю с типом Учитывать в рассчетах тоже ставить false
      */
      if (keyToEdit.type === this.InputType.BOOLEAN_ROOM_PARAMETERS && !value) {
        const computedKey = this.allKeys.find(
          k => k.type === this.InputType.BOOLEAN_ROOM_COMPUTED,
        )
        if (!computedKey) {
          return keysToUpdate
        }
        keysToUpdate.push({
          key: computedKey.id,
          value: false,
        })
        return keysToUpdate
      }
      /* 
        2) Если поле с типом Учитывать в рассчетах поменялось на true,
        а поле с типом Указывается параметры равно false, то не менять поле
        Учитывать в рассчетах
      */
      if (keyToEdit.type === this.InputType.BOOLEAN_ROOM_COMPUTED && value) {
        const parametersKey = this.allKeys.find(
          k => k.type === this.InputType.BOOLEAN_ROOM_PARAMETERS,
        )
        if (!parametersKey) {
          return keysToUpdate
        }
        const row = this.values[index]
        const value = row.data[parametersKey.id]
        if (!value) {
          keysToUpdate.push({
            key: field,
            value: false,
          })
        }
      }
      return keysToUpdate
    },
    async change(index, field, value) {
      try {
        const keysToEdit = this.getKeysToEdit(index, field, value)
        const tableData = JSON.parse(JSON.stringify(this.values))
        const values = tableData.map((row, rowIndex) => {
          if (rowIndex === index) {
            row.data[field] = value
            if (keysToEdit.length > 0) {
              keysToEdit.forEach(key => {
                row.data[key.key] = key.value
              })
            }
          }
          return row
        })

        await this.updateValues({
          id: this.directoryId,
          values,
        })
        //rerender table
        if (keysToEdit.length > 0) {
          this.updateDirectory({ id: this.directory._id, data: this.directory })
        }
      } catch (error) {
        this.updateDirectory({ id: this.directory._id, data: this.directory })
      }
    },
    async createKeyHandler() {
      if (this.isArchirectureInUse) {
        return console.error('Данная архитектура используется в редакции')
      }
      const response = await this.$refs['key-modal'].show({
        title: 'Добавить колонку',
        okButton: 'Добавить',
        cancelButton: 'Отмена',
      })
      if (!response) return

      this.createKey(response)
    },
    async editKey(id) {
      if (this.isArchirectureInUse) {
        return console.error('Данная архитектура используется в редакции')
      }
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
        const { response } = error
        const message = response ? response.data.message : error.message
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        })
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
      <template #body="{ index, data }">
        <div class="table-buttons">
          <Button
            icon="pi pi-clone"
            class="p-button-rounded"
            @click="cloneRow(data, index)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="removeRow(index)"
          />
        </div>
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

.table-buttons {
  display: flex;
  gap: 5px;
}

::v-deep(.p-column-header-content) {
  flex-direction: row-reverse;
  gap: 10px;
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

.create-cell {
  min-width: 100px;
  display: flex;
  justify-content: center;
}
</style>
