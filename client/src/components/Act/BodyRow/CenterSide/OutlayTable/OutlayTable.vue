<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import tableRowColors from '@/mixins/tableRowColors.mixin'
import { getValuesInside } from '@/store/modules/outlay.module'
import { filterTreeByQuantity } from '@/store/modules/acts.module'

export default {
  components: { TableGroup },
  mixins: [tableRowColors],
  computed: {
    ...mapGetters('outlay', ['rooms', 'keys']),
    ...mapGetters('acts', [
      'actsData',
      'acts',
      'completedValues',
      'changeView',
      'act',
    ]),
    croppedActs() {
      const index = this.acts.findIndex(a => a._id === this.act._id)
      return [...this.acts].slice(0, index + 1)
    },
    completed() {
      return this.rooms.reduce((acc, r) => {
        const values = this.croppedActs
          .map(act => {
            return this.completedValues[act._id][r.id]
          })
          .flat()
        const uniq = new Set(values)
        acc[r.id] = [...uniq]
        return acc
      }, {})
    },
    dataWithRooms() {
      return this.getDataWithRooms()
    },
    viewData() {
      if (this.changeView) {
        return this.getDataWithCategories()
      }
      return this.dataWithRooms
    },
  },
  methods: {
    updateNodesInTree(node, newNodes) {
      const { key, children } = node
      const isInNewNode = newNodes.find(n => n.key === key)
      if (isInNewNode) {
        return isInNewNode
      }
      if (children && children.length > 0) {
        node.children = children.map(n => this.updateNodesInTree(n, newNodes))
      }
      return node
    },
    sumQuantities(nodes) {
      const node = nodes.reduce((acc, node) => {
        if (!Object.keys(acc).length) {
          return node
        }
        const { data: accData } = acc
        const { data: nodeData } = node
        const quantity = accData.quantity + nodeData.quantity
        const newData = {
          ...accData,
          quantity,
        }
        return {
          ...acc,
          data: newData,
        }
      }, {})
      return node
    },
    mergeChildren(nodes) {
      const groupped = nodes.reduce((acc, node) => {
        acc[node.key] = acc[node.key] || []
        const { children } = node
        const data = children.length > 0 ? children : node
        acc[node.key].push(data)
        return acc
      }, {})
      if (nodes && nodes.length > 0 && nodes[0].children.length === 0) {
        const summed = Object.values(groupped).map(this.sumQuantities)
        return summed
      }
      return Object.entries(groupped).map(([key, values]) => {
        const node = nodes.find(n => n.key === key)
        const { children } = node
        if (children && children.length > 0) {
          const flatted = values.flat()
          node.children = this.mergeChildren(flatted)
          return node
        }
        return node
      })
    },
    getDataWithRooms() {
      const roomsData = Object.entries(this.actsData).reduce(
        (acc, [key, value]) => {
          const isInCropped = this.croppedActs.find(a => a._id === key)
          if (isInCropped) {
            return [...acc, value]
          }
          return acc
        },
        [],
      )
      const rooms = [...this.rooms].reverse()
      return rooms.map(room => {
        const roomValues = roomsData.map(r => r[room.id]).flat()

        const values = roomValues.reduce((acc, data) => {
          const nodes = getValuesInside(data)
          return [...acc, ...nodes]
        }, [])

        const groupped = values.reduce((acc, node) => {
          acc[node.key] = acc[node.key] || []
          acc[node.key].push(node)
          return acc
        }, {})
        const summed = Object.values(groupped).map(this.sumQuantities)
        const cloneJobs = JSON.parse(JSON.stringify(room.jobs))
        const children = cloneJobs
          .map(n => this.updateNodesInTree(n, summed))
          .flat()
        const filtered = children.filter(filterTreeByQuantity)

        return {
          key: room.id,
          data: {
            [this.keys[0].id]: room.name,
          },
          children: filtered,
          room: true,
          level: 0,
        }
      })
    },
    getDataWithCategories() {
      const data = JSON.parse(JSON.stringify(this.dataWithRooms))
      const categories = data.map(r => r.children).flat()
      const categoriesData = this.mergeChildren(categories)
      return categoriesData
    },
    scrollTo(roomId, nodeKey) {
      const { wrapper } = this.$refs
      if (!wrapper) return
      const tableData = wrapper.getBoundingClientRect()
      const row = this.getRow(roomId, nodeKey)
      if (!row) {
        return
      }
      const rowData = row.getBoundingClientRect()
      const level = +row.dataset.level
      const stickyRowsHeight = level * 32
      const offsetFromTable = rowData.top - tableData.top - stickyRowsHeight
      wrapper.scrollTo({
        top: offsetFromTable + wrapper.scrollTop,
        behavior: 'smooth',
      })
    },
    getRow(roomId, nodeKey) {
      const { wrapper } = this.$refs
      if (this.changeView) {
        return wrapper.querySelector(`.table-row[data-id="${nodeKey}"]`)
      }
      return wrapper.querySelector(
        `.table-row[data-room="${roomId}"][data-id="${nodeKey}"]`,
      )
    },
  },
}
</script>

<template>
  <div class="tree-table">
    <div class="table-grid" ref="wrapper">
      <TableGroup
        v-for="node in viewData"
        ref="table"
        :key="node.key"
        :node="node"
        :room="node.key"
        :level="0"
        :isRoom="!changeView"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;
}

.table-grid {
  flex: 1;
  @include darkScroll;
  overflow-y: overlay;
  position: relative;
}
</style>
