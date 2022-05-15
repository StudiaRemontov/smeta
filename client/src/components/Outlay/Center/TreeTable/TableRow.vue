<script>
import { mapGetters, mapMutations } from 'vuex'
import StretchedRow from './TableRows/StretchedRow.vue'
import DefaultRow from './TableRows/DefaultRow.vue'
import SelectedRow from './TableRows/SelectedRow.vue'
import CloneRow from './TableRows/CloneRow.vue'

import rowColors from '@/mixins/tableRowColors.mixin'

export default {
  name: 'TalbeRow',
  components: { StretchedRow, DefaultRow, SelectedRow, CloneRow },
  mixins: [rowColors],
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
      'roots',
      'keys',
      'showOnlyChecked',
      'quantityKey',
      'priceKey',
      'striped',
      'selectedValues',
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
      }
    },
    rowStyle() {
      if (this.isCategory) {
        return {
          backgroundColor: this.colors[this.level],
        }
      }
      return {}
    },
    sum() {
      const quantity = this.data[this.quantityKey.id]
      const price = this.data[this.priceKey.id]
      return (quantity * price).toFixed(2)
    },
    selected() {
      return this.selectedValues.includes(this.node.key)
    },
  },
  methods: {
    ...mapMutations('outlay', [
      'selectJob',
      'unselectJob',
      'updateNodeChildren',
    ]),
    select() {
      if (this.showOnlyChecked || this.isCloneEditing) {
        return
      }
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
    clone() {
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

      const children = [
        ...this.parent.children.slice(0, this.index + 1),
        {
          ...newNode,
        },
        ...this.parent.children.slice(this.index + 1),
      ]
      this.updateNodeChildren({ node: this.parent, children })
      this.selectJob(newNode)
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
  <tr
    class="table-row"
    :class="{ parent: isCategory, selected, striped }"
    :style="rowStyle"
    v-bind="rowAttrs"
    @click="select"
  >
    <StretchedRow v-if="isCategory" :data="data" />
    <template v-else-if="!isClone">
      <DefaultRow v-if="!selected" :node="node" :sum="sum" @clone="clone" />
      <SelectedRow v-else :node="node" :sum="sum" @clone="clone" />
    </template>
    <template v-else>
      <CloneRow
        :node="node"
        :sum="sum"
        :isEditing="isCloneEditing"
        @toggleEdit="toggleEdit"
        @remove="removeClone"
      />
    </template>
  </tr>
  <template v-if="children && children.length > 0">
    <TableRow
      v-for="(child, index) in children"
      :key="child.key"
      :node="child"
      :level="level + 1"
      :index="index"
      :parent="node"
      @select-node="select"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  @include table-row;
}
</style>
