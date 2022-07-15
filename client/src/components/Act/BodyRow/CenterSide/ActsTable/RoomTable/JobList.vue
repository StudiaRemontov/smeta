<script>
import { mapGetters } from 'vuex'
import TableRow from './TableRow.vue'
import actsTable from '@/mixins/actsTable.mixin'

export default {
  name: 'JobList',
  components: { TableRow },
  mixins: [actsTable],
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
    ...mapGetters('acts', ['act']),
    data() {
      return this.node.data
    },
    children() {
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
  <div v-if="title" class="table-row table-row--category" :style="rowStyle">
    <div class="table-cell">
      {{ title }}
    </div>
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
  height: 32px;

  &--category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
    z-index: calc(10 - v-bind(level));
    height: 32px;
    text-align: center;
    font-weight: 400;
    line-height: 15px;
    font-weight: 600;
  }
}
.table-cell {
  @include table-cell;
}
</style>
