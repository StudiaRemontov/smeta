<script>
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'

import { mapGetters, mapMutations } from 'vuex'
import TableCell from './TableCell1.vue'

export default {
  name: 'TableGroup',
  components: {
    TableCell,
    Button,
    ToggleButton,
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
    striped: Boolean,
  },
  data() {
    return {
      editClone: false,
    }
  },
  computed: {
    ...mapGetters('edition', ['active']),
    ...mapGetters('outlay', ['selectedRoom', 'activeData', 'showOnlySelected']),
    data() {
      return this.node.data
    },
    keys() {
      return this.active.keys
    },
    children() {
      if (this.showOnlySelected) {
        if (this.node.children && this.node.children.length > 0) {
          const hasValues = !this.isObjectId(this.node.children[0].key)
          if (hasValues) {
            return this.node.children.filter(n => {
              return this.selectedRoom.jobs.find(j => j.key === n.key)
            })
          }
        }
      }

      return this.node.children
    },
    isParent() {
      return this.children && this.children.length > 0
    },
    rowClassName() {
      if (this.isParent) {
        return 'table__row--sticky root'
      }

      return this.striped ? 'striped' : ''
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
          backgroundColor: `#b7f0ba`,
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
      if (!this.selectedRoom) return false
      return this.selectedRoom.jobs.find(j => j.key === this.node.key)
    },
  },
  methods: {
    ...mapMutations('outlay', ['addJob', 'removeJob', 'updateNode']),
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
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
    v-if="(isParent && children.length > 0) || !isParent"
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
      :editClone="editClone && node.isClone"
      :editable="!!isSelected"
      :key="key"
      :col="key"
      :children="!isParent"
      :colspan="isParent ? keys.length : 0"
    >
    </TableCell>
    <th>
      <div v-if="isSelected" class="actions">
        <ToggleButton
          v-if="node.isClone"
          v-model="editClone"
          onIcon="pi pi-check"
          offIcon="pi pi-pencil"
          class="p-button-rounded p-button-secondary p-button-lg p-button-text"
          @click.stop
        />
        <Button
          icon="pi pi-copy"
          class="p-button-rounded p-button-secondary p-button-lg p-button-text"
          @click.stop="cloneClick"
        />
      </div>
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
      :striped="striped"
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

    &.striped:nth-child(even) {
      background-color: rgb(232, 232, 232);
    }
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

::v-deep(.p-togglebutton.p-button:not(.p-disabled):not(.p-highlight):hover) {
  background-color: transparent !important;
}
::v-deep(.p-togglebutton) {
  &.p-button.p-highlight:hover {
    background-color: transparent !important;
  }

  .p-button-icon-left {
    color: #607d8b !important;
  }
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.root {
  color: $color-light;
}
</style>
