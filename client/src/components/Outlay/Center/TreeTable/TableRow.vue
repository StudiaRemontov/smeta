<script>
import { mapGetters, mapMutations } from 'vuex'
import TableCell from './TableCell.vue'
import rowColors from '@/mixins/tableRowColors.mixin'

export default {
  components: { TableCell },
  mixins: [rowColors],
  props: {
    node: {
      type: Object,
    },
    rowIndex: Number,
    selected: Boolean,
  },
  data() {
    return {
      isCloneEditing: false,
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'roots',
      'selectedRoom',
      'activeData',
      'keys',
      'showOnlyChecked',
      'quantityKey',
      'priceKey',
      'striped',
    ]),
    data() {
      return this.node.data
    },
    isCategory() {
      return this.node.children.length > 0
    },
    isClone() {
      return this.node.isClone
    },
    rowAttrs() {
      if (this.isCategory) {
        return {
          'data-id': this.node.key,
          'data-level': this.node.level,
        }
      }
      return {
        'data-id': this.node.key,
      }
    },
    rowStyle() {
      if (this.isCategory) {
        return {
          backgroundColor: this.colors[this.node.level],
        }
      }
      return {}
    },
    visibleKeys() {
      return this.isCategory ? [this.keys[0]] : this.keys
    },
    sum() {
      const quantity = this.data[this.quantityKey.id]
      const price = this.data[this.priceKey.id]
      return (quantity * price).toFixed(2)
    },
  },
  methods: {
    ...mapMutations('outlay', [
      'selectJob',
      'unselectJob',
      'pushNodeAfter',
      'removeNode',
    ]),
    getParents(node) {
      const parentNode = this.roots.find(n =>
        n.children.find(c => c.key === node.key),
      )

      if (!parentNode) {
        return [node]
      }
      if (parentNode.level > 0) {
        return [node, ...this.getParents(parentNode)]
      }

      return [node, parentNode]
    },
    select() {
      if (this.isCategory || this.showOnlyChecked) {
        return
      }
      const parents = this.getParents(this.node)
      if (this.selected) {
        return parents.forEach(this.unselectJob)
      }
      return parents.forEach(this.selectJob)
    },
    clone() {
      const newNode = {
        ...this.node,
        key: Date.now() + '',
        isClone: true,
      }
      this.pushNodeAfter({
        node: JSON.parse(JSON.stringify(newNode)),
        index: this.rowIndex + 1,
      })
      this.selectJob(newNode)
    },
    removeClone() {
      this.removeNode(this.node.key)
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
    <template v-if="isCategory">
      <td
        v-for="key in visibleKeys"
        class="table-cell"
        :colspan="keys.length + 2"
        :key="key.id"
      >
        {{ data[key.id] }}
      </td>
    </template>
    <template v-else>
      <TableCell
        v-for="key in visibleKeys"
        v-model.lazy="data[key.id]"
        :key="key.id"
        :col="key.id"
        :isClone="isClone"
        :isEditing="isCloneEditing"
        :isSelected="selected"
      />
    </template>

    <td v-if="!isCategory" class="table-cell">
      {{ sum }}
    </td>
    <td v-if="!isCategory" class="table-cell table-cell--actions">
      <div class="table-cell__actions">
        <template v-if="isClone">
          <button class="button" @click.stop="toggleEdit">
            <i v-if="isCloneEditing" class="pi pi-check"></i>
            <i v-else class="pi pi-pencil"></i>
          </button>
          <button class="button" @click.stop="removeClone">
            <i class="pi pi-trash"></i>
          </button>
        </template>
        <button
          v-if="selected && !isClone && !showOnlyChecked"
          class="button"
          @click.stop="clone"
        >
          <i class="pi pi-copy"></i>
        </button>
      </div>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.table-row {
  position: relative;
  cursor: pointer;

  &.striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }

  &.parent {
    color: $color-light;
  }

  &.selected:not(&.parent) {
    background-color: #b7f0ba;
  }
}

.button {
  background-color: transparent;
  cursor: pointer;
  border: none;
}
.table-cell {
  &__actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.table-cell {
  padding: 8px;
  text-align: left;
}
</style>
