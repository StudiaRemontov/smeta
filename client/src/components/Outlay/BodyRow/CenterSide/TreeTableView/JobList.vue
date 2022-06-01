<script>
import { mapGetters, mapMutations } from 'vuex'
import TableRow from './TableRow.vue'
import EditableTableRow from '../TreeTable/TableRow.vue'

export default {
  name: 'JobList',
  components: { TableRow, EditableTableRow },
  inject: ['editable'],
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
      if (!this.editable) {
        return {
          gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr))`,
        }
      }
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
      }
    },
    selected() {
      return this.selectedValues.includes(this.node.key)
    },
  },
  methods: {
    ...mapMutations('outlay', ['selectJob', 'unselectJob']),
    select() {
      if (!this.selected) {
        this.selectJob(this.node)
        return this.$emit('select-node')
      }

      if (this.isCategory) {
        const hasSelectedValues = !!this.node.children.find(n =>
          this.selectedValues.includes(n.key),
        )

        if (!hasSelectedValues) {
          this.unselectJob(this.node)
        }
        return this.$emit('select-node')
      }
      this.unselectJob(this.node)
      this.$emit('select-node')
    },
  },
}
</script>

<template>
  <div v-if="title" class="table-row table-row--category" :style="headerStyle">
    <div class="table-cell">
      {{ title }}
    </div>
  </div>
  <template v-if="editable">
    <EditableTableRow
      v-for="(child, index) in children"
      :key="child.key"
      :node="child"
      :level="level + 1"
      :room="room"
      :parent="node"
      :index="index"
      @select-node="select"
    />
  </template>
  <template v-else>
    <TableRow
      v-for="child in children"
      :key="child.key"
      :node="child"
      :level="level"
      :room="room"
    />
  </template>
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
    background-color: $table-subcategory-color;
    font-weight: 400;
    line-height: 15px;
    color: #ffffff;
  }
}
.table-cell {
  @include table-cell;
}
</style>
