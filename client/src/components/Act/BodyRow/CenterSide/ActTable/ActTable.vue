<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import tableRowColors from '@/mixins/tableRowColors.mixin'
import { formatNumber } from '@/helpers/formatNumber'
import { getValuesInside } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup },
  mixins: [tableRowColors],
  provide() {
    return {
      editable: false,
    }
  },
  computed: {
    ...mapGetters('outlay', ['rooms', 'keys', 'priceKey']),
    ...mapGetters('acts', [
      'activeRoom',
      'act',
      'roomsData',
      'showOnlyCompleted',
      'completedValues',
    ]),
    data() {
      if (!this.roomsData || !this.act) {
        return []
      }
      const room = this.rooms.find(r => r.id === this.activeRoom.id)
      return [room].map(room => {
        const children = this.showOnlyCompleted
          ? this.roomsData[room.id].filter(n =>
              this.completedValues.includes(n.key),
            )
          : this.roomsData[room.id]
        return {
          key: room.id,
          data: {
            [this.keys[0].id]: this.act.name,
          },
          children,
          room: true,
          level: 0,
        }
      })
    },
    sum() {
      const roomsDataClone = JSON.parse(
        JSON.stringify(this.roomsData[this.activeRoom.id]),
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
  border-left: 1px black solid;
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
