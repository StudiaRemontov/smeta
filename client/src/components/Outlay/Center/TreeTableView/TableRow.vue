<script>
import { mapGetters } from 'vuex'
import tableRowColors from '@/mixins/tableRowColors.mixin'

export default {
  mixins: [tableRowColors],
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey', 'striped']),
    isRoom() {
      return this.node.room
    },
    isParent() {
      return this.node.children.length > 0 && !this.isRoom
    },
    colspan() {
      return this.isParent || this.isRoom ? this.keys.length + 1 : 0
    },
    data() {
      return this.node.data
    },
    visibleKeys() {
      return this.isParent || this.isRoom ? [this.keys[0]] : this.keys
    },
    sum() {
      const quantity = this.data[this.quantityKey.id]
      const price = this.data[this.priceKey.id]
      return (quantity * price).toFixed(2)
    },
    rowStyle() {
      if (!this.isParent) {
        return {}
      }

      return {
        backgroundColor: this.colors[this.node.level - 1] || this.colors[0],
      }
    },
  },
}
</script>

<template>
  <tr
    class="table-row"
    :data-id="node.key"
    :data-level="node.level"
    :class="{ parent: isParent, room: isRoom, striped }"
    :style="rowStyle"
  >
    <td
      v-for="key in visibleKeys"
      class="table-cell"
      :key="key.id"
      :colspan="colspan"
    >
      {{ data[key.id] }}
    </td>
    <td v-if="!isParent && !isRoom" class="table-cell">{{ sum }}</td>
  </tr>
</template>

<style lang="scss" scoped>
.table-row {
  &.striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }

  &.parent {
    background-color: var(--blue-600);
  }

  &.room {
    background-color: $color-dark !important;
  }

  &.parent .table-cell,
  &.room .table-cell {
    background-color: transparent;
    color: $color-light !important;
  }
  &.room .table-cell {
    text-align: center;
  }
  &.striped .table-cell {
    background-color: transparent;

    color: #000;
  }
}

.table-cell {
  padding: 8px;
  background-color: $color-light;
  @include table-cell;
}
</style>
