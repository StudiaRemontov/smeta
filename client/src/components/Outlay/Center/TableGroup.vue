<script>
import Button from 'primevue/button'

import { mapGetters, mapMutations } from 'vuex'
import TableCell from './TableCell.vue'

export default {
  name: 'TableGroup',
  components: {
    TableCell,
    Button,
  },
  props: {
    parent: Object,
    node: {
      type: Object,
      required: true,
    },
    level: Number,
    root: Boolean,
    index: Number,
  },
  computed: {
    ...mapGetters('edition', ['active']),
    ...mapGetters('outlay', ['room', 'activeData']),
    data() {
      return this.node.data
    },
    keys() {
      return this.active.keys
    },
    children() {
      return this.node.children
    },
    isParent() {
      return this.children && this.children.length > 0
    },
    rowClassName() {
      if (this.isParent) {
        return 'table__row--sticky root'
      }
      return ''
    },
    rowStyle() {
      if (this.isParent) {
        return {
          top: `${this.level * 32}px`,
          backgroundColor: `var(--blue-${700 - this.level * 100})`,
        }
      }
      if (this.isSelected) {
        return {
          backgroundColor: `var(--green-200)`,
        }
      }

      return {}
    },
    attrs() {
      if (this.isParent) {
        return {
          'data-id': this.node.key,
          'data-level': this.level,
          'data-index': this.index,
        }
      }
      return {
        'data-id': this.node.key,
      }
    },
    isSelected() {
      if (!this.room) return false
      return this.room.jobs.find(j => j.key === this.node.key)
    },
  },
  methods: {
    ...mapMutations('outlay', ['addJob', 'removeJob', 'updateNode']),
    select() {
      if (!this.isSelected) {
        return this.addJob(this.node)
      }
      this.removeJob(this.node)
    },
    insert(arr, index, newItem) {
      return [
        ...arr.slice(0, index),
        {
          ...newItem,
          key: Date.now() + '',
        },
        ...arr.slice(index),
      ]
    },
    updateNode(node, key, newChildren) {
      if (node.key === key) {
        return (node.children = newChildren)
      }

      node.children.forEach(n => {
        return this.updateNode(n, key, newChildren)
      })
    },
    cloneClick() {
      const newNode = {
        ...this.node,
        key: Date.now() + '',
        isClone: true,
      }
      const newChildren = this.insert(
        this.parent.children,
        this.index + 1,
        newNode,
      )
      this.updateNode(this.activeData, this.parent.key, newChildren)
      this.addJob(newNode)
    },
  },
}
</script>

<template>
  <tr
    class="table__row"
    :class="rowClassName"
    v-bind="attrs"
    :style="rowStyle"
    @click="select"
    @contextmenu="showMenu"
  >
    <TableCell
      v-for="(val, key) in data"
      v-model="data[key]"
      :isClone="node.isClone"
      :editable="!!isSelected"
      :key="key"
      :col="key"
      :children="!isParent"
      :colspan="isParent ? keys.length : 0"
    >
    </TableCell>
    <th>
      <Button
        v-if="isSelected"
        icon="pi pi-copy"
        class="p-button-rounded p-button-secondary p-button-lg p-button-text"
        @click.stop="cloneClick"
      />
    </th>
  </tr>
  <template v-if="isParent">
    <TableGroup
      v-for="(child, indx) in children"
      :key="child.key"
      :node="child"
      :level="level + 1"
      :index="indx"
      :parent="node"
    />
  </template>
</template>

<style lang="scss" scoped>
.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  &__row {
    cursor: pointer;
  }

  &__row--sticky &__cell {
    background-color: transparent;
    color: $color-light;
  }

  &__cell {
    padding: 8px;
    text-align: center;
    &:not(&--children) {
      font-weight: 600;
      text-align: center !important;
    }

    &:first-of-type {
      text-align: left;
    }
  }
}

.root {
  color: $color-light;
}
</style>
