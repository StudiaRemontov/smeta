<script>
import { mapActions, mapGetters } from 'vuex'
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
  emits: ['select-node'],
  computed: {
    ...mapGetters('outlay', ['keys', 'selectedValues', 'showOnlyChecked']),
    data() {
      return this.node.data
    },
    children() {
      if (this.showOnlyChecked) {
        return this.node.children.filter(n =>
          this.selectedValues.includes(n.key),
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
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
      }
    },
    selected() {
      return this.selectedValues.includes(this.node.key)
    },
  },
  methods: {
    ...mapActions('outlay', ['toggleCategoryJobs']),
  },
}
</script>

<template>
  <div v-if="title" class="table-row table-row--category" :style="headerStyle">
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

  &--category {
    font-weight: 600;
    position: sticky;
    top: calc(32px * v-bind(level));
    z-index: calc(10 - v-bind(level));
    height: 32px;
    line-height: 15px;
    text-align: center;
  }
}
.table-cell {
  @include table-cell;
}
</style>
