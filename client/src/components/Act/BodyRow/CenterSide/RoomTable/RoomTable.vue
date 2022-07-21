<script>
import { mapGetters } from 'vuex'
import { computed } from 'vue'

import TableGroup from './TableGroup.vue'
import ActTable from '../ActTable/ActTable.vue'
import actsTable from '@/mixins/actsTable.mixin'
import { getValuesInside } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup, ActTable },
  mixins: [actsTable],
  provide() {
    return {
      overWorked: computed(() => this.overWorked),
      categoriesData: computed(() => this.categoriesData),
      setFilterLeft: this.setFilterLeft,
    }
  },
  props: {
    room: {
      required: true,
      type: Object,
      default: () => ({}),
    },
    actTable: Boolean,
  },
  data() {
    return {
      categoriesData: {},
    }
  },
  computed: {
    ...mapGetters('outlay', ['rooms', 'keys', 'quantityKey']),
    ...mapGetters('acts', [
      'showOnlyCompleted',
      'completedValues',
      'actsData',
      'act',
      'acts',
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
      const cloneJobs = JSON.parse(
        JSON.stringify(this.actsData[this.act._id][this.room.id]),
      )
      const data = cloneJobs.map(n => this.updateNodesInTree(n, summed)).flat()
      const children = this.showOnlyCompleted
        ? data.filter(n =>
            this.completedValues[this.act._id][this.room.id].includes(n.key),
          )
        : data
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
      const children = this.showOnlyCompleted
        ? this.actsData[this.act._id][this.room.id].filter(n =>
            this.completedValues[this.act._id][this.room.id].includes(n.key),
          )
        : this.actsData[this.act._id][this.room.id]
      return {
        key: this.act._id,
        data: [
          {
            key: this.room.id,
            data: {
              [this.keys[0].id]: this.act.name,
            },
            children,
            room: true,
            level: 0,
          },
        ],
      }
    },
    overWorked() {
      const nodes = this.data.map(getValuesInside).flat()
      return nodes.filter(n => n.data.quantity > n.data[this.quantityKey.id])
    },
  },
  watch: {
    room: {
      handler() {
        this.initCategoriesData()
      },
      immediate: true,
    },
  },
  methods: {
    initCategoriesData() {
      const cloneData = JSON.parse(JSON.stringify(this.data[0].children))
      const categories = cloneData.map(this.getCategories).flat()
      const overWorked = categories.filter(cat => {
        const { children } = cat
        const completed = children.filter(node => {
          const { data } = node
          const actQuantity = data.quantity
          const outlayQuantity = data[this.quantityKey.id]
          return outlayQuantity <= actQuantity
        })
        cat.children = completed
        return completed.length > 0
      })
      this.categoriesData = overWorked.reduce((acc, cat) => {
        const { key, children } = cat
        const completed = children.map(c => c.key)
        acc[key] = {
          filterLeft: true,
          completed,
        }
        return acc
      }, {})
    },
    getCategories(node) {
      const { children } = node
      if (!children.length) {
        return []
      }
      const subCategories = children.map(this.getCategories).flat()
      if (children[0].children && !children[0].children.length) {
        return [node, ...subCategories]
      }
      return subCategories
    },
    setFilterLeft(categoryKey, value) {
      this.categoriesData[categoryKey].filterLeft = value
    },
    scrollTo(nodeKey) {
      const { wrapper } = this.$refs
      if (!wrapper) return
      const top = this.getCordsOfRow(nodeKey)
      wrapper.scrollTo({
        top,
        behavior: 'smooth',
      })
    },
    getCordsOfRow(key) {
      const { wrapper } = this.$refs
      if (!wrapper) return
      const tableData = wrapper.getBoundingClientRect()
      const row = wrapper.querySelector(`.table-row[data-id="${key}"]`)
      if (!row) {
        return
      }
      const rowData = row.getBoundingClientRect()
      const level = +row.dataset.level
      const stickyRowsHeight = level * 32
      const offsetFromTable = rowData.top - tableData.top - stickyRowsHeight
      return offsetFromTable + wrapper.scrollTop
    },
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
  <div
    v-if="data && data[0].children.length > 0"
    ref="wrapper"
    class="table-wrapper"
    :class="{ acts: actTable }"
  >
    <div class="tree-table" :class="{ acts: actTable }">
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
        <div class="table-row" :style="rowStyle">
          <div v-for="key in keys" :key="key.id" class="table-cell"></div>
        </div>
      </div>
    </div>
    <div class="acts-wrapper">
      <ActTable :act="actData.key" :data="actData.data" :room="room" />
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
