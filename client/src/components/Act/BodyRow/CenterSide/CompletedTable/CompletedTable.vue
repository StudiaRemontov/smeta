<script>
import RoomTable from '../RoomTable/RoomTable.vue'
import ActsTable from '@/mixins/actsTable.mixin'

import { formatNumber } from '@/helpers/formatNumber'
import { getValuesInside } from '@/store/modules/outlay.module'
import { mapGetters } from 'vuex'

export default {
  components: { RoomTable },
  mixins: [ActsTable],
  props: {
    rooms: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters('outlay', ['priceKey']),
    ...mapGetters('acts', ['roomsData', 'act']),
    sum() {
      const total = this.rooms.reduce((total, room) => {
        const roomsDataClone = JSON.parse(
          JSON.stringify(this.roomsData[room.id]),
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
}
</script>

<template>
  <div class="completed-table">
    <RoomTable
      v-for="room in rooms"
      :acts="[act]"
      :key="room.id"
      :room="room"
    />
    <div class="results-row">
      <div class="table-row table-row--stretched" :style="rowStyle">
        <div class="table-cell"></div>
      </div>
      <div class="table-row table-row--result">
        <div class="act-table-cell">Итого</div>
        <div class="act-table-cell">
          {{ sum }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.completed-table {
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
    position: sticky;
    right: 0px;
  }
}

.results-row {
  display: grid;
  grid-template-columns: 1fr 201px;
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
