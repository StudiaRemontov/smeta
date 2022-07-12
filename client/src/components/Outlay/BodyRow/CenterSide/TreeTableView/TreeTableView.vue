<script>
import { computed } from 'vue'
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import { filterNodes } from '@/store/modules/outlay.module'
import { opacityGenerator } from '@/helpers/opacityGenerator'

export default {
  components: { TableGroup },
  provide() {
    return {
      editable: false,
      opacities: computed(() => this.opacities),
    }
  },
  data() {
    return {
      opacities: [],
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'rooms',
      'selectedValues',
      'keys',
      'roomsData',
      'selectedRoom',
    ]),
    data() {
      if (!this.roomsData) {
        return []
      }
      const reversed = [...this.rooms].reverse()
      if (reversed.length === 0 || this.selectedRoom) return []
      return reversed.map(room => {
        const clone = JSON.parse(JSON.stringify(this.roomsData[room.id]))
        const children = clone
          .map(node => filterNodes(node, this.selectedValues[room.id]))
          .flat()

        if (!room) return {}
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
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr))`,
      }
    },
  },
  mounted() {
    const depths = this.data.map(d => this.getTreeDepth(d, 0))
    const maxDepth = Math.max(...depths)
    const depth = maxDepth
    this.opacities = opacityGenerator(depth)
  },
  methods: {
    getTreeDepth(node, depth) {
      const { children } = node
      let result = depth
      if (children && children.length > 0) {
        const depths = children.map(c => this.getTreeDepth(c, depth + 1))
        const max = Math.max(...depths)
        result = max
      }
      return result
    },
    treeToList(node, list) {
      const { children } = node
      if (children && children.length > 0) {
        if (children[0].children.length === 0) {
          return [node]
        }
        return [
          ...list,
          node,
          ...node.children.map(c => this.treeToList(c, list)).flat(),
        ]
      }
      return list
    },
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
  <div class="tree-table" ref="wrapper">
    <div class="table-grid">
      <TableGroup
        v-for="node in data"
        ref="table"
        :key="node.key"
        :node="node"
        :room="node.key"
        :level="0"
        isRoom
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;
  @include darkScroll;
  overflow-y: overlay;
}

.table-grid {
  flex: 1;
  min-width: fit-content;
  position: relative;
}
</style>
