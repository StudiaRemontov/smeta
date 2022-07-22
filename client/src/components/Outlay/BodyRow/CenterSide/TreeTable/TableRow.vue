<script>
import { computed } from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import StretchedRow from './TableRows/StretchedRow.vue'
import DefaultRow from './TableRows/DefaultRow.vue'
import SelectedRow from './TableRows/SelectedRow.vue'
import CloneRow from './TableRows/CloneRow.vue'

export default {
  name: 'TalbeRow',
  components: { StretchedRow, DefaultRow, SelectedRow, CloneRow },
  provide() {
    return {
      changed: computed(() => this.changed),
    }
  },
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
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
      }
    },
    sum() {
      const quantity = this.data[this.quantityKey.id]
      const price = this.data[this.priceKey.id]
      const coef = this.node.coef
      return quantity * (price * coef)
    },
    selected() {
      return this.selectedValues.includes(this.node.key)
    },
    current() {
      return this.currentNode?.key === this.node.key
    },
    changed() {
      return this.node.coef !== 1
    },
  },
  methods: {
    ...mapMutations('outlay', [
      'selectJob',
      'updateNodeChildren',
      'toggleNodeEditing',
      'setCurrentNode',
      'setNodeEditing',
    ]),
    ...mapActions('outlay', ['selectJob', 'unSelectJob', 'toggleCategoryJobs']),
    async rowClickHandler(e) {
      const { target } = e
      const { cellindex } = target.dataset
      const index = parseInt(cellindex)
      if (index > 0 || isNaN(index)) {
        return
      }
      this.selectJob(this.node)
      this.setCurrentNode(this.node)
      if (this.isClone) {
        return
      }
      const quantity = this.data[this.quantityKey.id]
      if (!isNaN(quantity) && quantity === 0) {
        this.setNodeEditing({ node: this.node, value: false })
        await this.$nextTick()
        this.setNodeEditing({ node: this.node, value: true })
      }
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
    :class="{
      parent: isCategory,
      selected,
      striped,
      current,
      editing: !isClone && node.isEditing && selected,
    }"
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
    font-weight: 600;
    text-align: center;
  }

  &.current {
    z-index: 2;
    border: 2px black solid;
  }

  &.editing {
    pointer-events: none;
  }

  &:not(.parent):not(.striped):hover {
    background-color: rgb(233, 233, 233) !important;
  }

  &:not(.parent):not(.striped).selected:hover {
    background-color: #d1eeb4 !important;
  }
}

.table-cell {
  @include table-cell;
}
</style>
