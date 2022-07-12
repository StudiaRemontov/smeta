<script>
import KeysRow from './KeysRow.vue'
import ValuesRow from './ValuesRow.vue'

export default {
  name: 'TableGroup',
  components: { KeysRow, ValuesRow },
  inject: ['keys', 'selectedNodes', 'pushNodes', 'removeNodes'],
  props: {
    node: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    level: Number,
  },
  emits: ['selected', 'unselected'],
  data() {
    return {
      rowColors: ['#268aad', '#57abc8'],
    }
  },
  computed: {
    children() {
      return this.node.children
    },
    groupName() {
      if (this.children && this.children.length === 0) {
        return null
      }
      return this.node.data[this.keys[0].id]
    },
    rowBackground() {
      return this.rowColors[this.level] || '#fff'
    },
    rowColor() {
      return this.level > 1 ? '#000' : '#fff'
    },
  },
  methods: {
    getAllChildren(node) {
      const { children } = node
      if (children && children.length > 0) {
        return [node, ...node.children.map(this.getAllChildren)].flat()
      }
      return node
    },
    onSelect() {
      this.pushNodes([this.node])
      return this.$emit('selected')
    },
    onUnselect() {
      const { children } = this.node
      const isAnyChildSelected = children.some(c => this.selectedNodes[c.key])
      if (isAnyChildSelected) {
        return
      }
      this.removeNodes([this.node])
      this.$emit('unselected')
    },
    onChecked() {
      const isNodeSelected = !!this.selectedNodes[this.node.key]
      if (!isNodeSelected) {
        this.pushNodes([this.node])
        return this.$emit('selected')
      }
      this.removeNodes([this.node])
      return this.$emit('unselected')
    },
    checkGroup() {
      const isSelected = !!this.selectedNodes[this.node.key]
      const children = this.getAllChildren(this.node)
      if (!isSelected) {
        this.pushNodes([this.node, ...children])
        return this.$emit('selected')
      }
      const isAnyChildUnSelected = children.some(
        c => !this.selectedNodes[c.key],
      )
      if (isAnyChildUnSelected) {
        return this.pushNodes(children)
      }
      this.removeNodes([this.node, ...children])
      this.$emit('unselected')
    },
  },
}
</script>

<template>
  <div class="table-group">
    <template v-if="children && children.length > 0">
      <KeysRow
        :name="groupName"
        :showKeys="!level"
        class="keys-row"
        @click="checkGroup"
      />
      <TableGroup
        v-for="child in children"
        :key="child.key"
        :node="child"
        :level="level + 1"
        @selected="onSelect"
        @unselected="onUnselect"
      />
    </template>
    <template v-else>
      <ValuesRow :node="node" @checked="onChecked" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.keys-row {
  position: sticky;
  top: calc(32px * v-bind(level));
  z-index: calc(10 - v-bind(level));
  color: v-bind(rowColor);
  background-color: v-bind(rowBackground) !important;
  font-weight: 600;
}
</style>
