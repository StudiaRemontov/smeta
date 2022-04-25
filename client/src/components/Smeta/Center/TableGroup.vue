<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TableGroup',
  props: {
    node: {
      type: Object,
      required: true,
    },
    index: Number,
    root: Boolean,
    rootIndex: Number,
  },
  computed: {
    ...mapGetters('edition', ['active']),
    data() {
      return this.node.data
    },
    children() {
      return this.node.children
    },
    isParent() {
      return this.children && this.children.length > 0
    },
    rowClassName() {
      if (this.isParent && !this.root) {
        return 'table__row--sticky'
      }
      return ''
    },
    rowStyle() {
      if (this.isParent) {
        return {
          top: `${this.index * 32}px`,
          backgroundColor: `var(--blue-${700 - this.index * 100})`,
        }
      }
      return {}
    },
    attrs() {
      if (this.root) {
        return {
          'data-index': this.rootIndex,
        }
      }
      return {}
    },
  },
}
</script>

<template>
  <tr
    class="table__row"
    :class="[rowClassName, { root }]"
    v-bind="attrs"
    :style="rowStyle"
  >
    <th
      v-for="(val, key) in data"
      :key="key"
      class="table__cell"
      :class="{ 'table__cell--children': !isParent }"
      :colspan="isParent ? active.keys.length : 0"
    >
      {{ val }}
    </th>
  </tr>
  <template v-if="isParent">
    <TableGroup
      v-for="child in children"
      :key="child.key"
      :node="child"
      :index="index + 1"
    />
  </template>
</template>

<style lang="scss" scoped>
.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  &__row {
    &--sticky {
      position: sticky;
      top: 0;
    }
  }

  &__row--sticky &__cell {
    background-color: transparent;
    color: $color-light;
  }

  &__cell {
    padding: 8px;
  }
}

.root {
  color: $color-light;
}
</style>
