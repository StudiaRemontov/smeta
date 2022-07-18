<script>
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    Dialog,
    DataTable,
    Column,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    nodeToSort: {
      type: Object,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      node: null,
      tableData: [],
    }
  },
  computed: {
    ...mapGetters('edition', ['selectedEdition']),
    ...mapGetters('directory', ['directories']),
    keys() {
      if (!this.selectedEdition) return []
      const { keys } = this.selectedEdition
      return [keys[0]]
    },
    display: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    ...mapActions('edition', ['update']),
    ...mapActions('directory', ['sort']),
    onShow() {
      this.node = JSON.parse(JSON.stringify(this.nodeToSort))
      this.tableData = this.nodeToSort.children.map(c => ({
        ...c.data,
        key: c.key,
      }))
    },
    onRowReorder(e) {
      const { value } = e
      this.tableData = value
    },
    updateNodeInTree(node, updatedNode) {
      const { key, children } = node
      const { key: updatedKey } = updatedNode
      if (key === updatedKey) {
        return updatedNode
      }
      if (children && children.length > 0) {
        node.children = children.map(c => this.updateNodeInTree(c, updatedNode))
      }
      return node
    },
    async save() {
      this.loading = true
      try {
        const editionClone = JSON.parse(JSON.stringify(this.selectedEdition))
        // перемещение справочников внутри справочника
        if (
          this.node.children &&
          this.node.children.length > 0 &&
          this.node.children[0].children &&
          this.node.children[0].children.length > 0
        ) {
          const { key: dirId } = this.node
          const directory = this.directories.find(d => d._id === dirId)
          const sortedChildren = this.tableData.map(item => item.key)
          const children = [
            ...new Set([...sortedChildren, ...directory.children]),
          ]
          await this.sort({ id: dirId, children })
          return this.close()
        }
        //пермещение работ внутри категории (временно, пока нету функции перемещения эдементов внутри справочника-архитектуры)
        const updatedChildren = this.tableData.map(data => {
          const { key } = data
          const node = this.node.children.find(n => n.key === key)
          return node
        })
        this.node.children = updatedChildren
        const { data } = editionClone
        const newTree = this.updateNodeInTree(data, this.node)
        const updatedData = {
          ...editionClone,
          data: newTree,
        }
        await this.update({ id: updatedData._id, data: updatedData })
        this.close()
      } catch (error) {
        const { response } = error
        const message = response ? response.data.message : error.message
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        })
      } finally {
        this.loading = false
      }
    },
    close() {
      const { dialog } = this.$refs
      dialog.close()
      this.node = null
      this.tableData = []
    },
  },
}
</script>

<template>
  <Dialog
    v-model:visible="display"
    ref="dialog"
    :style="{ width: '70vw' }"
    :modal="true"
    :draggable="false"
    :closeOnEscape="false"
    :closable="!loading"
    @show="onShow"
  >
    <template #header>
      <span class="modal-title">
        Изменить порядок категории "{{ nodeToSort.data[keys[0].id] }}"
      </span>
    </template>
    <div class="modal-body">
      <DataTable
        :value="tableData"
        :reorderableColumns="true"
        scrollHeight="flex"
        :scrollable="true"
        @rowReorder="onRowReorder"
      >
        <Column
          :rowReorder="true"
          headerStyle="width: 3rem"
          :reorderableColumn="false"
          style="cursor: move"
        >
        </Column>
        <Column
          v-for="col of keys"
          :key="col.id"
          :field="col.id"
          :header="col.name"
        ></Column>
      </DataTable>
    </div>
    <template #footer>
      <button class="button save-button" :disabled="loading" @click="save">
        <i v-if="loading" class="pi pi-spin pi-spinner"></i>
        Сохранить
      </button>
      <button class="button cancel-button" :disabled="loading" @click="close">
        Отмена
      </button>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.modal {
  &-title {
    font-size: 22px;
    font-weight: 600;
  }

  &-body {
    display: flex;
    flex-direction: column;
    min-height: 0px;
    gap: 10px;
  }
}

.save-button,
.cancel-button {
  padding: 7px 15px;
  border-radius: 5px;
  color: #fff;

  &:disabled {
    opacity: 0.5;
  }
}

.save-button {
  background-color: #28c430;
}

.cancel-button {
  background-color: #797979;
}

::v-deep(.p-datatable) {
  max-height: 60vh;
  @include darkScroll;
}
::v-deep(.p-datatable-scrollable .p-datatable-thead > tr > th) {
  flex: unset !important;
}

::v-deep(.p-datatable-scrollable .p-datatable-tbody > tr > td) {
  flex: unset;
  &:not(:first-child) {
    flex: 1;
  }
}
</style>
