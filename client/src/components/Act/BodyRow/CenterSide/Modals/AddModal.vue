<script>
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import JobsTable from '../JobsTable/JobsTable.vue'
import { mapActions, mapGetters } from 'vuex'
import { computed } from 'vue'

import { getValuesInside } from '@/store/modules/outlay.module'
import { outlayViewKeys } from '@/enum/outlayKeys'

import { uniqBy } from 'lodash'

export default {
  components: { Dialog, JobsTable, InputText },
  provide() {
    return {
      keys: computed(() => this.keys),
      selectedNodes: computed(() => this.selectedNodes),
      pushNodes: this.pushNodes,
      removeNodes: this.removeNodes,
      updateNode: this.updateNodeInTable,
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      initted: false,
      tableData: null,
      filteredTableData: null,
      selectedNodes: {},
      keys: null,
      edition: null,
      search: '',
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay', 'quantityKey']),
    ...mapGetters('edition', ['editions']),
    ...mapGetters('directory', ['directories']),
    ...mapGetters('acts', ['act', 'activeRoom']),
    display: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    addButtonDisabled() {
      const selected = Object.values(this.selectedNodes)
      const isValidNodes = selected.every(node => {
        const { data, children } = node
        if (children.length > 0) {
          return true
        }
        return data[this.quantityKey.id] > 0
      })
      return !selected.length || !isValidNodes
    },
  },
  methods: {
    ...mapActions('outlays', ['update']),
    ...mapActions('acts', ['setActsData', 'setOutlay']),
    onShow() {
      this.initTableData()
    },
    filterNodes(node, callback) {
      const { children } = node
      if (children.length === 0) {
        return true
      }
      node.children = children.filter(callback)
      if (node.children.length > 0) {
        node.children = node.children.filter(c => this.filterNodes(c, callback))
        return node.children.length > 0
      }
      return false
    },
    getKeys() {
      if (!this.edition) {
        return []
      }
      const { dirId } = this.edition
      const directory = this.directories.find(d => d._id === dirId)
      const { keys } = directory
      const requiredKeys = outlayViewKeys.map(keyType => {
        const key = keys.find(k => k.type === keyType)
        return key
      })
      return requiredKeys
    },
    createTableData() {
      if (!this.outlay) {
        return
      }
      const outlayClone = JSON.parse(JSON.stringify(this.outlay))
      const outlayRoom = outlayClone.rooms.find(
        room => room.id === this.activeRoom.id,
      )
      const { jobs: roomJobs, newJobs } = outlayRoom
      const fullJobs = [...roomJobs, ...newJobs]
      const jobs = fullJobs.map(getValuesInside).flat()
      const uniq = uniqBy(jobs, 'key')
      const keys = uniq.map(n => n.key)
      const { edition } = outlayClone
      const editionInUse = this.editions.find(e => e._id === edition)
      this.edition = JSON.parse(JSON.stringify(editionInUse))
      const { data } = JSON.parse(JSON.stringify(editionInUse))
      this.tableData = data.children.filter(c =>
        this.filterNodes(c, n => {
          n.data[this.quantityKey.id] = 0
          return !keys.includes(n.key)
        }),
      )
      const tableData = this.tableData.filter(n => n.children.length > 0)
      this.tableData = JSON.parse(JSON.stringify(tableData))
      this.filteredTableData = JSON.parse(JSON.stringify(tableData))
      this.keys = this.getKeys()
    },
    initTableData() {
      this.createTableData()
      this.initted = true
    },
    pushNodes(nodes) {
      nodes.forEach(n => {
        if (this.selectedNodes[n.key]) {
          return
        }
        this.selectedNodes[n.key] = n
      })
    },
    removeNodes(nodes) {
      nodes.forEach(n => {
        if (this.selectedNodes[n.key]) {
          delete this.selectedNodes[n.key]
        }
      })
    },
    createTreeFromNodes() {
      const data = JSON.parse(JSON.stringify(this.tableData))
      const selectedNodes = Object.keys(this.selectedNodes)
      const tree = data.filter(c =>
        this.filterNodes(c, node => {
          const isInSelected = selectedNodes.includes(node.key)
          if (isInSelected) {
            node.added = true
            return true
          }
          return false
        }),
      )
      return tree
    },
    mergeNodes(nodes) {
      const groupped = nodes.reduce((acc, node) => {
        acc[node.key] = acc[node.key] || []
        const { children } = node
        const data = children.length > 0 ? children : node
        acc[node.key].push(data)
        return acc
      }, {})
      return Object.entries(groupped).map(([key, values]) => {
        const node = nodes.find(n => n.key === key)
        const { children } = node
        if (children && children.length > 0) {
          const flatted = values.flat()
          node.children = this.mergeNodes(flatted)
          return node
        }
        return node
      })
    },
    async save() {
      this.loading = true
      try {
        const currentRoom = this.outlay.rooms.find(
          r => r.id === this.activeRoom.id,
        )
        if (!currentRoom) {
          return this.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Перед добавлением нужно выбрать комнату',
            life: 3000,
          })
        }
        const cloneRoom = JSON.parse(JSON.stringify(currentRoom))
        const { newJobs } = cloneRoom
        const tree = JSON.parse(JSON.stringify(this.createTreeFromNodes()))
        const merged = this.mergeNodes([...tree, ...newJobs].flat())
        cloneRoom.newJobs = merged
        const newOutlay = JSON.parse(JSON.stringify(this.outlay))
        const updatedRooms = newOutlay.rooms.map(r => {
          if (r.id === this.activeRoom.id) {
            return cloneRoom
          }
          return r
        })
        const data = {
          ...newOutlay,
          rooms: updatedRooms,
        }
        await this.update({ id: data._id, data })
        this.setActsData()
        this.close()
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    close() {
      const { dialog } = this.$refs
      dialog.close()
      this.selectedNodes = {}
      this.search = null
    },
    onInput() {
      if (this.timeout) {
        this.timeout = clearTimeout(this.timeout)
      }
      if (!this.search) {
        this.filteredTableData = JSON.parse(JSON.stringify(this.tableData))
        return
      }
      this.timeout = setTimeout(() => {
        if (!this.search) {
          return
        }
        const tableData = JSON.parse(JSON.stringify(this.tableData))
        this.filteredTableData = tableData.filter(c =>
          this.filterNodes(c, node => {
            const { data, children } = node
            if (children.length > 0) {
              return true
            }
            const name = data[this.keys[0].id] || ''
            const loweredName = name.toLowerCase()
            const loweredSearch = this.search.toLowerCase()
            return loweredName.includes(loweredSearch)
          }),
        )
      }, 1000)
    },
    updateNode(node, newNode) {
      const { key, children } = node
      const { key: newKey } = newNode
      if (key === newKey) {
        return newNode
      }
      node.children = children.map(c => this.updateNode(c, newNode))
      return node
    },
    updateNodeInTable(newNode) {
      this.tableData = this.tableData.map(n => this.updateNode(n, newNode))
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
    :closable="!addButtonDisabled"
    @show="onShow"
  >
    <template #header>
      <span class="modal-title">Добавить работы</span>
    </template>
    <div v-if="initted" class="modal-body">
      <div class="search">
        <InputText
          v-model="search"
          class="search-input"
          placeholder="Название работы"
          @input="onInput"
        />
      </div>
      <JobsTable :data="filteredTableData" />
    </div>
    <template #footer>
      <button
        class="button save-button"
        :disabled="addButtonDisabled"
        @click="save"
      >
        <i v-if="loading" class="pi pi-spin pi-spinner"></i>
        Добавить
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

.search-input {
  width: 100%;
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
</style>
