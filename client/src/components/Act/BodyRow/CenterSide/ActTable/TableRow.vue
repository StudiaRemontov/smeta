<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { formatNumber } from '@/helpers/formatNumber'

import { actStatus } from '../../../../../enum/actStatus'

import InputNumber from '@/components/UI/InputNumber.vue'
import TableRowWrapper from '../CommonTable/TableRowWrapper.vue'

export default {
  name: 'TableRow',
  components: {
    InputNumber,
    TableRowWrapper,
  },
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
      timeout: null,
    }
  },
  computed: {
    ...mapGetters('outlay', ['priceKey', 'striped']),
    ...mapGetters('acts', ['act', 'hoveredItem', 'selectedItem']),
    data() {
      return this.node.data
    },
    children() {
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    sum() {
      const quantity = this.data.quantity || 0
      const price = this.data[this.priceKey.id]
      return formatNumber(quantity * price)
    },
    isEditable() {
      return this.act.status !== actStatus.CONFIRMED
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
  },
  methods: {
    ...mapMutations('acts', ['updateById', 'setHoveredItem']),
    ...mapActions('acts', ['saveLocaly']),
    changeHandler() {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(async () => {
        await this.saveLocaly()
      }, 300)
    },
    mouseEnterHandler() {
      this.setHoveredItem({ id: this.node.key, room: this.room })
    },
    mouseLeaveHandler() {
      this.setHoveredItem(null)
    },
  },
}
</script>

<template>
  <TableRowWrapper
    class="table-row"
    :class="{ category: isCategory, striped, hovered, selected }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <div class="table-cell">
      <InputNumber
        v-model="data.quantity"
        class="input"
        :disabled="!isEditable"
        :min="0"
        @change="changeHandler"
      />
    </div>
    <div class="table-cell">{{ sum }}</div>
  </TableRowWrapper>
  <template v-if="isCategory">
    <TableRow
      v-for="child in children"
      :key="child.key"
      :node="child"
      :room="room"
      :level="level + 1"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  grid-template-columns: 1fr 1fr;

  &.category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
    height: 32px;
  }

  &:not(.category).striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }
}

.table-cell {
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  @include act-table-cell;
}

.input {
  max-width: 100%;
  width: 100%;
  text-align: center;
}
</style>
