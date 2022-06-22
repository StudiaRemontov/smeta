<script>
import TableGroup from './TableGroup.vue'
import ActTable from '../ActTable/ActTable.vue'
import ResultTable from '../ResultTable/ResultTable.vue'
import actsTable from '@/mixins/actsTable.mixin'
import { getValuesInside } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup, ActTable, ResultTable },
  mixins: [actsTable],
  props: {
    room: {
      required: true,
      type: Object,
      default: () => ({}),
    },
    acts: {
      required: true,
      type: Array,
      default: () => [],
    },
    actTable: Boolean,
  },
  computed: {
    completed() {
      const nodes = this.room.jobs.map(getValuesInside).flat()
      return nodes.map(({ key }) => key)
    },
    data() {
      return [
        {
          key: this.room.id,
          data: {
            [this.keys[0].id]: this.room.name,
          },
          children: this.room.jobs,
          room: true,
          level: 0,
        },
      ]
    },
    actData() {
      return this.acts.map(act => {
        const children = this.data[0].children
        return {
          act,
          data: [
            {
              key: this.room.id,
              data: {
                [this.keys[0].id]: act.name,
              },
              children,
              room: true,
            },
          ],
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
  },
}
</script>

<template>
  <div class="table-wrapper" :class="{ acts: actTable }">
    <div class="tree-table" :class="{ acts: actTable }">
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
        <div class="table-row" :style="rowStyle">
          <div v-for="key in keys" :key="key.id" class="table-cell"></div>
        </div>
      </div>
    </div>
    <div v-if="actData && actData.length > 0" class="acts-wrapper">
      <ActTable
        v-for="act in actData"
        :key="act.key"
        :act="act.act"
        :data="act.data"
        :room="room"
      />
      <ResultTable :acts="actData" :room="room" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  display: flex;
  min-height: 0px;
  overflow-y: overlay;
  overflow-x: auto;
  @include darkScroll;

  &.acts {
    display: flex;
    min-width: fit-content;
  }
}

.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;
  border-right: 1px black solid;

  &.acts {
    position: sticky;
    left: 0px;
    z-index: 21;
    flex: 1;
  }
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
  display: grid;
}

.acts-wrapper {
  display: flex;
  gap: 1px;
  // max-width: 201px;

  & > .tree-table {
    position: sticky;
    left: 0px;
  }
}

.table-cell {
  @include table-cell;
}
</style>
