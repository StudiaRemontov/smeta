<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
    isParent() {
      return this.node.children.length > 0 || this.node.room
    },
    colspan() {
      return this.isParent ? this.keys.length + 1 : 0
    },
    data() {
      return this.node.data
    },
    visibleKeys() {
      return this.isParent ? [this.keys[0]] : this.keys
    },
    sum() {
      const quantity = this.data[this.quantityKey.id]
      const price = this.data[this.priceKey.id]
      return (quantity * price).toFixed(2)
    },
  },
}
</script>

<template>
  <tr
    class="table-row"
    :data-id="node.key"
    :data-level="node.level"
    :class="{ parent: isParent }"
  >
    <td
      v-for="key in visibleKeys"
      class="table-cell"
      :key="key.id"
      :colspan="colspan"
    >
      {{ data[key.id] }}
    </td>
    <td v-if="!isParent" class="table-cell">{{ sum }}</td>
  </tr>
</template>

<style lang="scss" scoped>
.table-row {
  &.parent {
    background-color: var(--blue-600);
  }

  &.parent .table-cell {
    background-color: transparent;
    color: $color-light;
  }
}

.table-cell {
  padding: 8px;
  background-color: $color-light;
}
</style>
