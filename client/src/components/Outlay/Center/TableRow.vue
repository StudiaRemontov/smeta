<script>
import { mapGetters, mapMutations } from 'vuex'
import TableCell from './TableCell.vue'

export default {
  components: { TableCell },
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
    ...mapGetters('outlay', ['roots', 'room', 'activeData']),
    data() {
      return this.node.data
    },
    isCategory() {
      return this.node.children.length > 0
    },
    keys() {
      return this.activeData.keys
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
  },
  mounted() {
    if (this.isClone) {
      this.isCloneEditing = true
    }
  },
  methods: {
    ...mapMutations('outlay', ['selectJob', 'unselectJob', 'pushNodeAfter']),
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
      if (this.isCategory) {
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
    :class="{ parent: isCategory, selected }"
    v-bind="rowAttrs"
    @click="select"
  >
    <TableCell
      v-for="(val, key) in data"
      v-model="data[key]"
      :key="key"
      :col="key"
      :colspan="isCategory ? keys.length + 1 : 0"
      :isClone="isClone"
      :isEditing="isCloneEditing"
      :isSelected="selected"
    />
    <!-- <td
      v-for="(val, key) in data"
      class="table-cell"
      :key="key"
      :colspan="isCategory ? keys.length + 1 : 0"
    >
      <input
        v-if="isClone && room"
        v-model="data[key]"
        class="input"
        type="text"
        @click.stop
      />
      <span v-else>
        {{ val }}
      </span>
    </td> -->
    <td v-if="!isCategory" class="table-cell table-cell--actions">
      <div class="table-cell__actions">
        <button v-if="isClone" class="button" @click.stop="toggleEdit">
          <i v-if="isCloneEditing" class="pi pi-check"></i>
          <i v-else class="pi pi-pencil"></i>
        </button>
        <button v-if="selected" class="button" @click.stop="clone">
          <i class="pi pi-copy"></i>
        </button>
      </div>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.table-row {
  cursor: pointer;

  &.striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }

  &.parent {
    color: $color-light;
    background-color: var(--blue-500);
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
  padding: 8px;
  text-align: center;

  &__actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

// &__row--sticky &__cell {
//   background-color: transparent;
//   color: $color-light;
// }
</style>
