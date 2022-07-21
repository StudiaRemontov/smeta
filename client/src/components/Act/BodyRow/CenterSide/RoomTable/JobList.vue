<script>
import { mapGetters } from 'vuex'
import TableRow from './TableRow.vue'
import actsTable from '@/mixins/actsTable.mixin'

export default {
  name: 'JobList',
  components: { TableRow },
  mixins: [actsTable],
  inject: ['categoriesData', 'setFilterLeft'],
  props: {
    node: {
      type: Object,
      required: true,
      default: () => {},
    },
    level: Number,
    room: String,
    hasTitle: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey']),
    ...mapGetters('acts', ['showOnlyCompleted', 'completedValues', 'act']),
    data() {
      return this.node.data
    },
    children() {
      let children = this.node.children
      if (this.canCollapse) {
        const categoryData = this.categoriesData[this.node.key]
        if (categoryData && categoryData.filterLeft) {
          children = children.filter(this.leftFilter)
        }
      }
      if (this.showOnlyCompleted) {
        children = children.filter(this.completedFilter)
      }
      return children
    },
    isCategory() {
      return this.children.length > 0
    },
    title() {
      if (this.hasTitle && isNaN(this.data.quantity)) {
        return this.data[this.keys[0].id]
      }
      return null
    },
    canCollapse() {
      return (
        !this.showOnlyCompleted &&
        this.title &&
        Object.keys(this.categoriesData).length > 0 &&
        this.categoriesData[this.node.key]
      )
    },
  },
  methods: {
    completedFilter(node) {
      return this.completedValues[this.act._id][this.room].includes(node.key)
    },
    leftFilter(node) {
      return !this.categoriesData[this.node.key].completed.includes(node.key)
    },
    toggleCollapse() {
      if (this.canCollapse) {
        const currentValue = this.categoriesData[this.node.key].filterLeft
        this.setFilterLeft(this.node.key, !currentValue)
      }
    },
  },
}
</script>

<template>
  <template v-if="title">
    <div class="table-row table-row--category" :style="rowStyle">
      <div class="table-cell">
        <button v-if="canCollapse" class="button" @click="toggleCollapse">
          {{ this.categoriesData[this.node.key].filterLeft ? '+' : '-' }}
        </button>
        {{ title }}
      </div>
    </div>
    <JobList
      v-for="child in children"
      :key="child.key"
      :node="child"
      :level="level + 1"
      :room="room"
    />
  </template>
  <TableRow v-else :node="node" :level="level" :room="room" />
</template>

<style lang="scss" scoped>
.table-row {
  display: grid;
  background-color: #fff;
  height: 32px;

  &--category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
    z-index: calc(10 - v-bind(level));
    height: 32px;
    text-align: center;
    font-weight: 600;
    line-height: 15px;
  }
}
.table-cell {
  @include table-cell;
}
</style>
