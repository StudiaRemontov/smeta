<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import StretchedRow from './TableRows/StretchedRow.vue'
import DefaultRow from './TableRows/DefaultRow.vue'
import SelectedRow from './TableRows/SelectedRow.vue'
import CloneRow from './TableRows/CloneRow.vue'

import rowColors from '@/mixins/tableRowColors.mixin'

export default {
  name: 'TalbeRow',
  components: { StretchedRow, DefaultRow, SelectedRow, CloneRow },
  mixins: [rowColors],
  inheritAttrs: false,
  props: {
    node: {
      type: Object,
    },
    level: Number,
    index: Number,
    parent: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters('outlay', [
      'keys',
      'striped',
      'selectedValues',
      'quantityKey',
      'priceKey',
      'showOnlyChecked',
      'currentRoomData',
      'currentNode',
    ]),
    data() {
      return this.node.data
    },
    children() {
      if (this.showOnlyChecked) {
        return this.node.children.filter(n =>
          this.selectedValues.includes(n.key),
        )
      }
      return this.node.children
    },
    isCategory() {
      return this.children.length > 0
    },
    isClone() {
      return this.node.isClone
    },
    rowAttrs() {
      if (this.isCategory) {
        return {
          'data-id': this.node.key,
          'data-level': this.level,
        }
      }
      return {
        'data-id': this.node.key,
        'data-level': this.level,
      }
    },
    rowStyle() {
      const keysLength = this.keys.length
      const style = {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
      }
      if (this.level > 2 && this.isCategory) {
        style.color = '#000'
        style.fontWeight = '700'
      }
      return style
    },
    sum() {
      const quantity = this.data[this.quantityKey.id]
      const price = this.data[this.priceKey.id]
      return quantity * price
    },
    selected() {
      return this.selectedValues.includes(this.node.key)
    },
    current() {
      return this.currentNode?.key === this.node.key
    },
  },
  methods: {
    ...mapMutations('outlay', [
      'selectJob',
      'updateNodeChildren',
      'toggleNodeEditing',
      'setCurrentNode',
    ]),
    ...mapActions('outlay', ['selectJob', 'unSelectJob', 'toggleCategoryJobs']),
    rowClickHandler(e) {
      if (this.isCategory) {
        return this.toggleCategoryJobs(this.node)
      }
      const { target } = e
      const { cellindex } = target.dataset
      const index = parseInt(cellindex)
      if (index > 0 || isNaN(index)) {
        return
      }
      if (this.node.isEditing) {
        return
      }
      this.selectJob(this.node)
      this.setCurrentNode(this.node)
    },
    getNodeFromTree(node, nodeKey, parents) {
      const { key, children } = node
      if (key === nodeKey) {
        return [...parents, node]
      }
      return children
        .map(c => this.getNodeFromTree(c, nodeKey, [...parents, node]))
        .flat()
    },
    async clone() {
      const clone = JSON.parse(JSON.stringify(this.node))
      const newNode = {
        ...clone,
        data: {
          ...clone.data,
          [this.keys[0].id]: clone.data[this.keys[0].id] + '*',
        },
        key: Date.now() + '',
        isClone: true,
        isEditing: true,
      }
      const { children } = this.parent
      const index = this.showOnlyChecked
        ? children.findIndex(n => n.key === this.node.key)
        : this.index

      const newChildren = [
        ...children.slice(0, index + 1),
        {
          ...newNode,
        },
        ...children.slice(index + 1),
      ]
      this.updateNodeChildren({ node: this.parent, children: newChildren })
      const parents = this.currentRoomData
        .map(n => this.getNodeFromTree(n, newNode.key, []))
        .flat()
      parents.forEach(this.selectJob)
      await this.$nextTick()
      this.setCurrentNode(newNode)
    },
    removeClone() {
      const children = this.parent.children.filter(c => c.key !== this.node.key)
      this.updateNodeChildren({ node: this.parent, children })
      this.unSelectJob(this.node)
    },
    toggleEdit() {
      this.toggleNodeEditing(this.node)
    },
  },
}
</script>

<template>
  <div
    class="table-row"
    v-bind="rowAttrs"
    :class="{ parent: isCategory, selected, striped, current }"
    :style="[rowStyle, $attrs.style]"
    @click="rowClickHandler"
  >
    <StretchedRow v-if="isCategory" :data="data" :level="level" />
    <template v-else-if="!isClone">
      <DefaultRow v-if="!selected" :node="node" :sum="sum" @clone="clone" />
      <SelectedRow
        v-else
        ref="selectedRow"
        :node="node"
        :sum="sum"
        @clone="clone"
      />
    </template>
    <CloneRow
      v-else
      :node="node"
      :sum="sum"
      :selected="selected"
      :isEditing="node.isEditing"
      @toggleEdit="toggleEdit"
      @remove="removeClone"
    />
  </div>
  <template v-if="isCategory">
    <TableRow
      v-for="(child, index) in children"
      :key="child.key"
      :node="child"
      :level="level + 1"
      :index="index"
      :parent="node"
      :style="$attrs.style"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  display: grid;
  align-items: center;
  background-color: #fff;

  @include table-row;

  &.parent {
    position: sticky;
    top: calc(32px * v-bind(level));
    z-index: calc(10 - v-bind(level));
  }

  &.parent &__cell {
    color: #fff;
  }

  &.current {
    z-index: 2;
    border: 2px black solid;
  }
}

.table-cell {
  @include table-cell;
}
</style>
