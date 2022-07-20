<script>
import { mapGetters } from 'vuex'

import TableGroup from './Common/TableGroup.vue'

import { formatNumber } from '@/helpers/formatNumber'
import { getValuesInside } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup },
  provide() {
    return {
      bold: true,
    }
  },
  inject: ['shortView'],
  props: {
    room: {
      required: true,
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'priceKey', 'quantityKey']),
    ...mapGetters('acts', [
      'roomsData',
      'showOnlyCompleted',
      'actsData',
      'acts',
      'act',
    ]),
    croppedActs() {
      const index = this.acts.findIndex(a => a._id === this.act._id)
      return [...this.acts].slice(0, index + 1)
    },
    data() {
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
      return children
    },
    resultData() {
      const children = this.data
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
    leftData() {
      const clone = JSON.parse(JSON.stringify(this.data))
      const children = clone.map(this.getTreeWithLeftData).flat()
      const data = [
        {
          key: this.room.id,
          data: {
            [this.keys[0].id]: 'Осталось',
          },
          children,
          room: true,
          level: 0,
        },
      ]
      return data
    },
    resultSum() {
      return this.getSum(this.resultData)
    },
    leftSum() {
      return this.getSum(this.leftData)
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
    getTreeWithLeftData(node) {
      const { children, data } = node
      if (children && children.length > 0) {
        node.children = children.map(this.getTreeWithLeftData)
        return node
      }
      const left = data[this.quantityKey.id] - data.quantity
      node.data.quantity = left < 0 ? 0 : left
      return node
    },
    getSum(data) {
      const roomsDataClone = JSON.parse(JSON.stringify(data))
      const nodes = roomsDataClone.map(getValuesInside).flat()
      const sum = nodes.reduce((acc, node) => {
        const { data } = node
        const quantity = data.quantity || 0
        const price = data[this.priceKey.id] || 0
        const sum = quantity * price
        return acc + sum
      }, 0)
      return formatNumber(sum)
    },
  },
}
</script>

<template>
  <div class="wrapper">
    <div class="tree-table">
      <div class="table-grid" ref="wrapper">
        <TableGroup
          v-for="node in resultData"
          ref="table"
          :key="node.key"
          :node="node"
          :level="0"
          :room="room.id"
          isAct
        />
        <div class="table-row">
          <div class="table-cell">Итого</div>
          <div class="table-cell">{{ resultSum }}</div>
        </div>
      </div>
    </div>
    <div v-if="shortView" class="tree-table">
      <div class="table-grid" ref="wrapper">
        <TableGroup
          v-for="node in leftData"
          ref="table"
          :key="node.key"
          :node="node"
          :level="0"
          :room="room.id"
          isAct
        />
        <div class="table-row">
          <div class="table-cell">Итого</div>
          <div class="table-cell">{{ leftSum }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
}

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
