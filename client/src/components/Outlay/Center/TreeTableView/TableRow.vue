<script>
import { mapGetters } from 'vuex'
import tableRowColors from '@/mixins/tableRowColors.mixin'

export default {
  name: 'TableGridRow',
  mixins: [tableRowColors],
  inheritAttrs: false,
  props: {
    node: {
      type: Object,
      required: true,
    },
    room: String,
    isRoom: Boolean,
    level: Number,
  },
  computed: {
    ...mapGetters('outlay', [
      'keys',
      'quantityKey',
      'priceKey',
      'selectedValues',
      'striped',
    ]),
    children() {
      return this.node.children.filter(n =>
        this.selectedValues[this.room].includes(n.key),
      )
    },
    isParent() {
      return this.children.length > 0 && !this.isRoom
    },
    parentKeys() {
      if (!this.isParent) return []
      const firstKey = {
        id: this.node.key,
        text: this.node.data[this.keys[0].id],
      }
      if (this.level === 1) {
        const allKeys = [...this.keys, { id: Date.now() + '', name: 'Сумма' }]
        return allKeys.map((key, index) => {
          if (index === 0) {
            return firstKey
          }
          return {
            text: key.name,
            id: key.id,
          }
        })
      }
      return [firstKey]
    },
    rowStyle() {
      if (!this.isParent) {
        return {}
      }
      return {
        backgroundColor: this.colors[this.level - 1] || this.colors[0],
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
    v-bind="$attrs"
    :class="{ parent: isParent, room: isRoom, striped }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    :style="rowStyle"
  >
    <template v-if="isParent">
      <div v-for="key in parentKeys" :key="key.id" class="table-row__cell">
        {{ key.text }}
      </div>
    </template>
    <div class="table-row__cell" v-else-if="isRoom">
      {{ node.data[keys[0].id] }}
    </div>
    <template v-else>
      <div
        v-for="key in keys"
        :key="key.id"
        class="table-row__cell"
        :title="node.data[key.id]"
      >
        {{ node.data[key.id] }}
      </div>
      <div v-if="!isParent && !isRoom" class="table-row__cell" :title="sum">
        {{ sum }}
      </div>
    </template>
  </div>
  <template v-if="children.length > 0">
    <TableGridRow
      v-for="child in children"
      :key="child.key"
      :node="child"
      :style="$attrs.style"
      :room="room"
      :level="level + 1"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  display: grid;
  align-items: center;

  &.striped:nth-child(even) {
    background-color: rgb(232, 232, 232);
  }

  &__cell {
    @include table-cell;
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

  &.room &__cell {
    text-align: center;
  }
}
</style>
