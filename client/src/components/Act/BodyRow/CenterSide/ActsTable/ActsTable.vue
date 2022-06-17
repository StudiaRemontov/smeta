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
    ...mapGetters('acts', ['roomsData', 'act', 'acts']),
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
  <div class="acts-table">
    <RoomTable
      v-for="room in rooms"
      :acts="acts"
      :key="room.id"
      :room="room"
      actTable
    />
    <div class="results-row">
      <div class="table-row table-row--sticky" :style="rowStyle">
        <div class="table-cell"></div>
      </div>
      <div
        v-for="act in acts"
        :key="act._id"
        class="table-row table-row--result"
      >
        <div class="act-table-cell">Итого</div>
        <div class="act-table-cell">
          {{ sum }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.acts-table {
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
  }

  &--sticky {
    position: sticky;
    left: 0px;
    z-index: 2;
  }
}

.results-row {
  display: flex;
  width: fit-content;

  &--stretched {
    flex: 1;
  }
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
