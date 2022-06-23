<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'
import ActTable from '../ActTable/ActTable.vue'
import actsTable from '@/mixins/actsTable.mixin'

export default {
  components: { TableGroup, ActTable },
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
    ...mapGetters('outlay', ['rooms', 'keys']),
    ...mapGetters('acts', [
      'showOnlyCompleted',
      'completedValues',
      'actsData',
      'act',
    ]),
    data() {
      const children = this.showOnlyCompleted
        ? this.actsData[this.act._id][this.room.id].filter(n =>
            this.completedValues[this.act._id][this.room.id].includes(n.key),
          )
        : this.actsData[this.act._id][this.room.id]
      return [
        {
          key: this.room.id,
          data: {
            [this.keys[0].id]: this.room.name,
          },
          children,
          room: true,
          level: 0,
        },
      ]
    },
    actData() {
      return this.acts.map(act => {
        const children = this.showOnlyCompleted
          ? this.actsData[act._id][this.room.id].filter(n =>
              this.completedValues[act._id][this.room.id].includes(n.key),
            )
          : this.actsData[act._id][this.room.id]

        return {
          key: act._id,
          data: [
            {
              key: this.room.id,
              data: {
                [this.keys[0].id]: act.name,
              },
              children,
              room: true,
              level: 0,
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
  },
}
</script>

<template>
  <div
    v-if="data && data[0].children.length > 0"
    class="table-wrapper"
    :class="{ acts: actTable }"
  >
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
    <div class="acts-wrapper">
      <ActTable
        v-for="act in actData"
        :key="act.key"
        :act="act.key"
        :data="act.data"
        :room="room"
      />
    </div>
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

  &.acts {
    display: flex;
    min-width: fit-content;
  }
}

.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;

  &.acts {
    position: sticky;
    left: 0px;
    z-index: 21;
    flex: 1;

    .acts {
      flex: 1;
      position: static;
    }
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

  & > .tree-table {
    position: sticky;
    left: 0px;
  }
}

.table-cell {
  @include table-cell;
}
</style>
