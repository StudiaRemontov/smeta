<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import tableRowColors from '@/mixins/tableRowColors.mixin'

import { filterNodes } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup },
  mixins: [tableRowColors],
  provide() {
    return {
      editable: false,
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
      const roomsData = Object.entries(this.roomsData)
      const reversed = [...roomsData].reverse()
      if (reversed.length === 0 || this.selectedRoom) return []
      return reversed.map(([key, values]) => {
        const foundRoom = this.rooms.find(acc => acc.id === key)
        const clone = JSON.parse(JSON.stringify(values))
        const children = clone
          .map(node => filterNodes(node, this.selectedValues[key]))
          .flat()

        if (!foundRoom) return {}
        return {
          key,
          data: {
            [this.keys[0].id]: foundRoom.name,
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
  methods: {
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
      const row = wrapper.querySelector(
        `.table-row[data-room="${roomId}"][data-id="${nodeKey}"]`,
      )
      const level = +row.dataset.level
      const offsetTop = 32 * (level - 1)
      wrapper.scrollTo({
        top: row.offsetTop - offsetTop,
        behavior: 'smooth',
      })
    },
  },
}
</script>

<template>
  <div class="tree-table">
    <div class="table-grid">
      <div class="table-grid__body" ref="wrapper">
        <TableGroup
          v-for="node in data"
          :key="node.key"
          :node="node"
          :room="node.key"
          :level="0"
          isRoom
        />
      </div>
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
  display: flex;
  flex-direction: column;
  min-height: 0px;
  position: relative;

  &__body {
    flex: 1;
    @include darkScroll;
    overflow-y: overlay;
    position: relative;
  }
}
</style>
