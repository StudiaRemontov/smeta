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
  inject: ['overWorked'],
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
    ...mapGetters('acts', [
      'act',
      'hoveredItem',
      'selectedItem',
      'showOnlyCompleted',
      'completedValues',
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
    added() {
      return this.node.added
    },
    isOverWorked() {
      return !!this.overWorked.find(n => n.key === this.node.key)
    },
  },
  watch: {
    selected(value) {
      if (value) {
        if (this.isCategory) {
          return
        }
        this.selectInput()
      }
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
    selectInput() {
      const { input } = this.$refs
      input.$el.select()
    },
    mouseEnterHandler() {
      if (this.isCategory) {
        return
      }
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
    :class="{
      category: isCategory,
      striped,
      hovered,
      selected,
      oranged: added || isOverWorked,
    }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    @mouseenter="mouseEnterHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <template v-if="!isCategory">
      <div class="table-cell">
        <InputNumber
          v-model="data.quantity"
          ref="input"
          class="input"
          :disabled="!isEditable"
          :min="0"
          @change="changeHandler"
          @focus="selectInput"
        />
      </div>
      <div class="table-cell">{{ sum }}</div>
    </template>
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
