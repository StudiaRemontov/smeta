<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'
import ActTable from '../ActTable/ActTable.vue'

export default {
  components: { TableGroup, ActTable },
  computed: {
    ...mapGetters('outlay', ['rooms', 'keys']),
    ...mapGetters('acts', [
      'activeRoom',
      'acts',
      'roomsData',
      'showOnlyCompleted',
      'completedValues',
    ]),
    data() {
      if (!this.roomsData) {
        return []
      }
      const room = this.rooms.find(r => r.id === this.activeRoom.id)
      return [room].map(room => {
        const children = this.showOnlyCompleted
          ? room.jobs.filter(n => this.completedValues.includes(n.key))
          : room.jobs
        return {
          key: room.id,
          data: {
            [this.keys[0].id]: room.name,
          },
          children,
          room: true,
          level: 0,
        }
      })
    },
  },
  methods: {
    scrollTo(roomId, nodeKey) {
      const { wrapper } = this.$refs
      if (!wrapper) return
      const tableData = wrapper.getBoundingClientRect()
      const row = wrapper.querySelector(
        `.table-row[data-room="${roomId}"][data-id="${nodeKey}"]`,
      )
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
  },
}
</script>

<template>
  <div class="table-wrapper">
    <div class="tree-table">
      <div class="table-grid" ref="wrapper">
        <TableGroup
          v-for="node in data"
          ref="table"
          :key="node.key"
          :node="node"
          :room="node.key"
          :level="0"
          isRoom
        />
        <div class="table-row"></div>
      </div>
    </div>
    <ActTable />
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  display: grid;
  grid-template-columns: 1fr 201px;
  min-height: 0px;
  overflow-y: overlay;
  overflow-x: auto;
  @include darkScroll;
}

.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;
  width: 100%;
}

.act-table {
  width: 200px;
}

.table-grid {
  flex: 1;
  position: relative;
  min-width: fit-content;
}

.table-row {
  @include table-row;
  height: 32px;
  background-color: #ccc;
}
</style>
