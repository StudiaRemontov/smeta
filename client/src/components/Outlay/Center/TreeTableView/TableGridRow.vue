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
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
    isRoom() {
      return this.node.room
    },
    isParent() {
      return this.node.children.length > 0 && !this.isRoom
    },
    rowStyle() {
      if (!this.isParent) {
        return {}
      }

      return {
        backgroundColor: this.colors[this.node.level - 1] || this.colors[0],
      }
    },
    sum() {
      const quantity = this.node.data[this.quantityKey.id]
      const price = this.node.data[this.priceKey.id]
      return (quantity * price).toFixed(2)
    },
  },
}
</script>

<template>
  <div
    class="table-row"
    :class="{ parent: isParent, room: isRoom }"
    :data-id="node.key"
    :data-level="node.level"
    :style="rowStyle"
  >
    <template v-if="isRoom">
      {{ node.data[keys[0].id] }}
    </template>
    <template v-else>
      <div v-for="key in keys" :key="key.id" class="table-row__cell">
        {{ node.data[key.id] }}
      </div>
      <div v-if="!isRoom && !isParent" class="table-row__cell">
        {{ sum }}
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.table-row {
  display: grid;
  align-items: center;

  &__cell {
    padding: 8px;
  }

  &.room {
    background-color: $color-dark;
    color: #fff;
    height: 32px;
    text-align: center;
    font-weight: 600;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.parent &__cell {
    color: #fff;
  }
}
</style>
