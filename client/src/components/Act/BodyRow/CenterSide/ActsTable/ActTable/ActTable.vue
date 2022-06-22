<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import { formatNumber } from '@/helpers/formatNumber'
import {
  getValuesInside,
  treeToListOnlyKeys,
} from '@/store/modules/outlay.module'

export default {
  components: { TableGroup },
  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    room: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    act: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'priceKey']),
    ...mapGetters('acts', ['actsData']),
    tempData() {
      const cloneData = JSON.parse(JSON.stringify(this.data))
      const completed = cloneData.map(treeToListOnlyKeys).flat()
      const clone = JSON.parse(
        JSON.stringify(this.actsData[this.act._id][this.room.id]),
      )
      const children = clone.filter(n => this.filterByCompleted(n, completed))
      const data = [
        {
          key: this.act._id,
          data: {
            [this.keys[0].id]: this.act.name,
          },
          children,
          room: true,
        },
      ]
      return data
    },
    sum() {
      const roomsDataClone = JSON.parse(
        JSON.stringify(this.actsData[this.act._id][this.room.id]),
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
      return formatNumber(sum)
    },
  },
  methods: {
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
  <div class="tree-table">
    <div class="table-grid" ref="wrapper">
      <TableGroup
        v-for="node in tempData"
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
  border-right: 1px black solid;
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
