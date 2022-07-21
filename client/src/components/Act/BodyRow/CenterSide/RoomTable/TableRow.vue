<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'
import { getNodeFromTree } from '@/store/modules/acts.module'
import actsTable from '@/mixins/actsTable.mixin'

import TableRowWrapper from '../CommonTable/TableRowWrapper.vue'
import TableRowData from '../CommonTable/TableRowData.vue'

import { actStatus } from '../../../../../enum/actStatus'

export default {
  name: 'TableRow',
  components: { TableRowWrapper, TableRowData },
  mixins: [actsTable],
  props: {
    node: {
      type: Object,
      required: true,
      default: () => {},
    },
    level: Number,
    room: String,
  },
  data() {
    return {
      isRemoving: false,
    }
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey', 'striped']),
    ...mapGetters('acts', [
      'showOnlyCompleted',
      'completedValues',
      'hoveredItem',
      'selectedItem',
      'act',
      'acts',
    ]),
    data() {
      return this.node.data
    },
    children() {
      if (this.showOnlyCompleted) {
        return this.node.children.filter(n =>
          this.completedValues[this.act._id][this.room].includes(n.key),
        )
      }
      return this.node.children || []
    },
    sum() {
      const quantity = this.node.data[this.quantityKey.id]
      const price = this.node.data[this.priceKey.id]
      return formatNumber(quantity * price)
    },
    hovered() {
      if (!this.hoveredItem) {
        return false
      }
      return (
        this.node.key === this.hoveredItem.id &&
        this.room === this.hoveredItem.room
      )
    },
    selected() {
      if (!this.selectedItem) {
        return false
      }
      return (
        this.node.key === this.selectedItem.id &&
        this.room === this.selectedItem.room
      )
    },
    rowData() {
      const cloneData = JSON.parse(JSON.stringify(this.data))
      return cloneData
    },
    canRemove() {
      const added = this.node?.added
      const { status } = this.act
      const isConfirmed = status === actStatus.CONFIRMED
      if (isConfirmed || !added) {
        return false
      }
      const confirmedActs = this.acts.filter(
        act => act.status === actStatus.CONFIRMED,
      )
      const isInConfirmed = confirmedActs.some(act => {
        const { rooms } = act
        const currentRoom = rooms.find(r => r.id === this.room)
        if (!currentRoom) {
          return false
        }
        const { jobs } = currentRoom
        const found = jobs.map(n => getNodeFromTree(n, this.node.key)).flat()
        return found.length > 0
      })
      return !isInConfirmed
    },
    added() {
      return this.node.added
    },
    overWorked() {
      const { data } = this.node
      return data[this.quantityKey.id] < this.data.quantity
    },
  },
  methods: {
    ...mapMutations('acts', ['setHoveredItem']),
    ...mapActions('acts', ['removeAddedJob']),
    mouseEnterHandler() {
      this.setHoveredItem({ id: this.node.key, room: this.room })
    },
    mouseLeaveHandler() {
      this.setHoveredItem(null)
    },
    async remove() {
      this.isRemoving = true
      try {
        await this.removeAddedJob({ roomId: this.room, nodeKey: this.node.key })
      } catch (error) {
        console.log(error)
      } finally {
        this.isRemoving = false
      }
    },
  },
}
</script>

<template>
  <TableRowWrapper
    class="table-row"
    :class="{
      striped,
      hovered,
      selected,
      oranged: added || overWorked,
    }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    :style="rowStyle"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <TableRowData
      :data="rowData"
      :canRemove="canRemove"
      :added="node.added"
      :loading="isRemoving"
      @remove="remove"
    />
  </TableRowWrapper>
</template>

<style lang="scss" scoped>
.table-row {
  font-weight: 400;
  &.striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }

  &:first-of-type {
    position: sticky;
    left: 0;
  }
}

.table-cell {
  white-space: nowrap;
  text-overflow: ellipsis;
  @include table-cell;
}
</style>
