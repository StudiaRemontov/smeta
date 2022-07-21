<script>
import { mapGetters } from 'vuex'
import TableRow from './TableRow.vue'

export default {
  name: 'JobList',
  components: { TableRow },
  inject: ['categoriesData'],
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
        children = children.filter(n =>
          this.completedValues[this.act._id][this.room].includes(n.key),
        )
        return children
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
    leftFilter(node) {
      return !this.categoriesData[this.node.key].completed.includes(node.key)
    },
  },
}
</script>

<template>
  <template v-if="title">
    <div class="table-row table-row--category">
      <div class="table-cell"></div>
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

  &--category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
    z-index: calc(10 - v-bind(level));
    height: 32px;
    font-weight: 400;
    line-height: 15px;
    color: #ffffff;
    grid-template-columns: 1fr 1fr;
  }
}
.table-cell {
  @include act-table-cell;
}
</style>
