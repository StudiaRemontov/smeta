<script>
import RoomTable from './RoomTable/RoomTable.vue'
import ActsTable from '@/mixins/actsTable.mixin'

import { formatNumber } from '@/helpers/formatNumber'
import {
  getValuesInside,
  treeToListOnlyKeys,
} from '@/store/modules/outlay.module'

import { filterTreeByQuantity } from '@/store/modules/acts.module'

import { mapGetters } from 'vuex'

export default {
  components: { RoomTable },
  mixins: [ActsTable],
  computed: {
    ...mapGetters('outlay', ['priceKey', 'rooms']),
    ...mapGetters('acts', ['actsData', 'act', 'acts']),
    croppedActs() {
      const index = this.acts.findIndex(a => a._id === this.act._id)
      return [...this.acts].slice(0, index + 1)
    },
    completed() {
      return this.rooms.reduce((acc, r) => {
        const data = JSON.parse(JSON.stringify(this.roomsData[r.id]))
        const filtered = JSON.parse(JSON.stringify(data)).filter(
          filterTreeByQuantity,
        )
        const keys = filtered.map(treeToListOnlyKeys).flat()
        const uniq = new Set(keys)
        acc[r.id] = [...uniq]
        return acc
      }, {})
    },
    roomsData() {
      const data = this.croppedActs.reduce((acc, act) => {
        this.rooms.forEach(room => {
          const roomData = JSON.parse(
            JSON.stringify(this.actsData[act._id][room.id]),
          )
          if (acc[room.id]) {
            acc[room.id] = [...acc[room.id], ...roomData]
            return
          }
          acc[room.id] = roomData
        })
        return acc
      }, {})

      return Object.entries(data).reduce((acc, [roomId, value]) => {
        const merged = this.mergeChildren(value)
        acc[roomId] = merged
        return acc
      }, {})
    },
    tableData() {
      if (!this.completed) return []
      const reversed = [...this.rooms].reverse()
      const data = reversed.map(room => {
        const cloneJobs = JSON.parse(JSON.stringify(this.roomsData[room.id]))
        const jobs = cloneJobs.filter(n =>
          this.filterByCompleted(n, this.completed[room.id]),
        )
        return {
          ...room,
          jobs,
        }
      })
      return data
    },
    sum() {
      const total = this.rooms.reduce((total, room) => {
        const roomsDataClone = JSON.parse(
          JSON.stringify(this.actsData[room.id]),
        )
        const nodes = roomsDataClone.map(getValuesInside).flat()
        const completed = nodes.filter(n => n.data.quantity > 0)
        const sum = completed.reduce((acc, node) => {
          const { data } = node
          const quantity = data.quantity
          const price = data[this.priceKey.id]
          const sum = quantity * price
          return acc + sum
        }, 0)
        return total + sum
      }, 0)
      return formatNumber(total)
    },
  },
  methods: {
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
    filterByCompleted(node, completed) {
      const { children, key } = node
      if (children && children.length > 0) {
        node.children = children.filter(n =>
          this.filterByCompleted(n, completed),
        )
        return node.children.length > 0
      }
      return completed.includes(key)
    },
    scrollTo(room, key) {
      const { table, wrapper } = this.$refs
      const foundTable = table.find(r => r.room.id === room)
      if (!foundTable) {
        return
      }
      const top = foundTable.getCordsOfRow(room, key)
      wrapper.scrollTo({
        top,
        behavior: 'smooth',
      })
    },
  },
}
</script>

<template>
  <div class="acts-table" ref="wrapper">
    <RoomTable
      v-for="room in tableData"
      ref="table"
      :acts="croppedActs"
      :key="room.id"
      :room="room"
      actTable
    />
  </div>
</template>

<style lang="scss" scoped>
.acts-table {
  width: 100%;
  overflow-x: auto;
  overflow-y: overlay;
  @include darkScroll;

  & > .table-wrapper {
    overflow: unset;
  }
}

.table-row {
  @include table-row;
  height: 32px;
  display: grid;
  background-color: #ccc;

  &--result {
    grid-template-columns: 1fr 1fr;
    border-left: 1px black solid;
    width: 200px;
  }

  &--sticky {
    position: sticky;
    left: 0px;
    z-index: 2;
    flex: 1;
  }
}

.results-row {
  display: flex;
  min-width: fit-content;
}

.acts {
  display: flex;
}

.table-cell {
  @include table-cell;
}
.act-table-cell {
  @include act-table-cell;
  text-align: center;
  font-weight: 700;
}
</style>
