<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TableGroup',
  props: {
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
      return {}
    },
  },
}
</script>

<template>
  <tr class="table__row" :class="rowClassName" v-bind="attrs" :style="rowStyle">
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
      v-for="(child, indx) in children"
      :key="child.key"
      :node="child"
      :level="level + 1"
      :index="indx"
    />
  </template>
</template>

<style lang="scss" scoped>
.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

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
