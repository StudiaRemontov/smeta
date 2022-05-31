<script>
import { mapGetters, mapMutations } from 'vuex'
import StretchedRow from './TableRows/StretchedRow.vue'
import DefaultRow from './TableRows/DefaultRow.vue'
import SelectedRow from './TableRows/SelectedRow.vue'
import CloneRow from './TableRows/CloneRow.vue'

import rowColors from '@/mixins/tableRowColors.mixin'

import emitter from '@/modules/eventBus'

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
  emits: ['select-node'],
  data() {
    return {
      isCloneEditing: false,
    }
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
      if (this.isCategory) {
        return {
          backgroundColor: this.colors[this.level],
          gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
        }
      }
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
      }
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
  mounted() {
    emitter.$on('editQuantity', key => {
      const { selectedRow } = this.$refs
      if (this.node.key === key) {
        if (this.isClone) {
          return (this.isCloneEditing = true)
        }
        if (!selectedRow) return
        selectedRow.setQuantityVisability(true)
      }
    })
    emitter.$on('stopEditQuantity', key => {
      const { selectedRow } = this.$refs
      if (this.node.key === key) {
        if (this.isClone) {
          return (this.isCloneEditing = false)
        }
        if (!selectedRow) return
        selectedRow.setQuantityVisability(false)
      }
    })
    if (!this.isClone) {
      return
    }
    emitter.$on('cloned', key => {
      if (this.node.key === key) {
        this.isCloneEditing = true
      }
    })
  },
  unmounted() {
    emitter.$off('cloned')
    emitter.$off('hideRow')
    emitter.$off('editQuantity')
    emitter.$off('stopEditQuantity')
  },
  methods: {
    ...mapMutations('outlay', [
      'selectJob',
      'unselectJob',
      'updateNodeChildren',
    ]),
    rowClickHandler(e) {
      const { target } = e
      const { cellindex } = target.dataset
      const index = parseInt(cellindex)
      if (index > 0 || isNaN(index)) {
        return
      }
      if (this.isCloneEditing) {
        return
      }
      this.select()
      emitter.$emit('selectNode', this.node.key)
    },
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
      emitter.$emit('cloned', newNode.key)
    },
    removeClone() {
      const children = this.parent.children.filter(c => c.key !== this.node.key)
      this.updateNodeChildren({ node: this.parent, children })
      if (this.selected) {
        return this.select()
      }
      this.unselectJob(this.node)
    },
    toggleEdit() {
      this.isCloneEditing = !this.isCloneEditing
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
      :isEditing="isCloneEditing"
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
      @select-node="select"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  display: grid;
  align-items: center;
  background-color: #fff;

  @include table-row;

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
