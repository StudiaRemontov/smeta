<script>
import Dialog from 'primevue/dialog'
import JobsTable from '../JobsTable/JobsTable.vue'
import { mapGetters } from 'vuex'
import { computed } from 'vue'

import { getValuesInside } from '@/store/modules/outlay.module'

import { uniqBy } from 'lodash'

export default {
  components: { Dialog, JobsTable },
  provide() {
    return {
      keys: computed(() => this.keys),
      selectedNodes: computed(() => this.selectedNodes),
      pushNodes: this.pushNodes,
      removeNodes: this.removeNodes,
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
      initted: false,
      tableData: null,
      selectedNodes: {},
      keys: null,
      edition: null,
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
    ...mapGetters('edition', ['editions']),
    ...mapGetters('directory', ['directories']),
    ...mapGetters('acts', ['act']),
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
        return node
      }
      return false
    },
    initTableData() {
      if (!this.outlay || (this.tableData && this.keys)) {
        return
      }
      const outlayClone = JSON.parse(JSON.stringify(this.outlay))
      const outlayJobs = outlayClone.rooms
        .reduce((acc, room) => {
          const jobs = room.jobs.map(getValuesInside).flat()
          acc = [...acc, jobs]
          return acc
        }, [])
        .flat()
      const uniq = uniqBy(outlayJobs, 'key')
      const keys = uniq.map(n => n.key)
      const { edition } = outlayClone
      const editionInUse = this.editions.find(e => e._id === edition)
      this.edition = JSON.parse(JSON.stringify(editionInUse))
      const { data } = this.edition
      this.tableData = data.children.filter(c =>
        this.filterNodes(c, n => !keys.includes(n.key)),
      )
      this.tableData = this.tableData.filter(n => n.children.length > 0)

      this.keys = this.edition.keys
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
      const { data } = JSON.parse(JSON.stringify(this.edition))
      const selectedNodes = Object.keys(this.selectedNodes)
      const tree = data.children.filter(c =>
        this.filterNodes(c, node => selectedNodes.includes(node.key)),
      )
      return tree
    },
    save() {
      //save method
      // const tree = this.createTreeFromNodes()
    },
    cancel() {
      const { dialog } = this.$refs
      dialog.close()
      //close modal
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
    @show="onShow"
  >
    <template #header>
      <span class="modal-title">Добавить работы</span>
    </template>
    <div v-if="initted" class="modal-body">
      <JobsTable :data="tableData" />
    </div>
    <template #footer>
      <button class="button save-button" @click="save">Добавить</button>
      <button class="button cancel-button" @click="cancel">Отмена</button>
    </template>
  </Dialog>
</template>

<style lang="scss" scoped>
.modal-title {
  font-size: 22px;
  font-weight: 600;
}

.save-button,
.cancel-button {
  padding: 7px 15px;
  border-radius: 5px;
  color: #fff;
}

.save-button {
  background-color: #28c430;
}

.cancel-button {
  background-color: #797979;
}
</style>
