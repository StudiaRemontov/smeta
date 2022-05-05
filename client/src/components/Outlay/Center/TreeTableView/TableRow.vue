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
    ...mapGetters('outlay', ['keys']),
    isParent() {
      return this.node.children.length > 0 || this.node.room
    },
    colspan() {
      return this.isParent ? this.keys.length : 0
    },
    data() {
      return this.node.data
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
      v-for="(value, key) in data"
      class="table-cell"
      :key="key"
      :colspan="colspan"
    >
      {{ value }}
    </td>
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
