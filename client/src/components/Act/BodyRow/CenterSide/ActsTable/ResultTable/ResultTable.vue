<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import { formatNumber } from '@/helpers/formatNumber'
import { getValuesInside } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup },
  props: {
    room: {
      required: true,
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters('outlay', ['rooms', 'keys', 'priceKey']),
    ...mapGetters('acts', ['roomsData', 'showOnlyCompleted', 'actsData']),
    data() {
      const roomsData = Object.values(this.actsData)
      const roomValues = roomsData
        .map(r => {
          const rooms = Object.entries(r).map(([key, value]) => {
            return {
              roomId: key,
              value,
            }
          })
          const room = rooms.find(r => r.roomId === this.room.id)
          return room.value
        })
        .flat()
      const values = roomValues.reduce((acc, data) => {
        const nodes = getValuesInside(data)
        return [...acc, ...nodes]
      }, [])
      const groupped = values.reduce((acc, node) => {
        acc[node.key] = acc[node.key] || []
        acc[node.key].push(node)
        return acc
      }, {})
      const summed = Object.values(groupped).map(nodes => {
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
      })
      const cloneJobs = JSON.parse(JSON.stringify(this.room.jobs))
      const children = cloneJobs
        .map(n => this.updateNodesInTree(n, summed))
        .flat()
      const data = [
        {
          key: this.room.id,
          data: {
            [this.keys[0].id]: 'Итого',
          },
          children,
          room: true,
          level: 0,
        },
      ]
      return data
    },
    sum() {
      const roomsDataClone = JSON.parse(JSON.stringify(this.data))
      const nodes = roomsDataClone.map(getValuesInside).flat()
      const sum = nodes.reduce((acc, node) => {
        const { data } = node
        const quantity = data.quantity
        const price = data[this.priceKey.id]
        const sum = quantity * price
        return acc + sum
      }, 0)
      return formatNumber(sum)
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
  },
}
</script>

<template>
  <div class="tree-table">
    <div class="table-grid" ref="wrapper">
      <TableGroup
        v-for="node in data"
        ref="table"
        :key="node.key"
        :node="node"
        :level="0"
        :room="room.id"
        isAct
      />
      <div class="table-row">
        <div class="table-cell">Итого</div>
        <div class="table-cell">{{ sum }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;
  max-width: 200px;
  width: 200px;
}

.table-grid {
  flex: 1;
  position: relative;
  min-width: fit-content;
}

.table-row {
  @include table-row;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #ccc;
}

.table-cell {
  text-align: center;
  @include act-table-cell;
  font-weight: 700;
}
</style>
