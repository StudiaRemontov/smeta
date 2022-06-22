<script>
import { mapGetters } from 'vuex'
import TableRow from './TableRow.vue'

export default {
  name: 'JobList',
  components: { TableRow },
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
    ...mapGetters('outlay', ['keys']),
    ...mapGetters('acts', ['showOnlyCompleted', 'completedValues', 'act']),
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
    title() {
      if (this.isCategory && this.hasTitle) {
        return this.data[this.keys[0].id]
      }
      return null
    },
  },
}
</script>

<template>
  <div v-if="title" class="table-row table-row--category">
    <div class="table-cell"></div>
  </div>
  <TableRow
    v-for="child in children"
    :key="child.key"
    :node="child"
    :level="level + 1"
    :room="room"
  />
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
    background-color: $table-subcategory-color;
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
