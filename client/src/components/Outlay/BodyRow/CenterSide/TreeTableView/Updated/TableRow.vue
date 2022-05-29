<script>
import { mapGetters } from 'vuex'
import HeaderCells from './HeaderCells.vue'

export default {
  name: 'TableRow',
  components: {
    HeaderCells,
  },
  props: {
    node: {
      type: Object,
      required: true,
      default: () => {},
    },
    level: Number,
    room: String,
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
    data() {
      return this.node.data
    },
    children() {
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr))`,
      }
    },
  },
}
</script>

<template>
  <div
    class="table-row"
    :class="{ category: isCategory }"
    :data-id="node.key"
    :data-level="level"
    :data-room="room"
    :style="headerStyle"
  >
    <HeaderCells v-if="isCategory" :title="data[keys[0].id]" />
    <template v-else>
      <div v-for="(val, key) in data" :key="key" class="table-cell">
        {{ val }}
      </div>
    </template>
  </div>
  <template v-if="isCategory">
    <TableRow
      v-for="child in children"
      :key="child.key"
      :node="child"
      :room="room"
      :level="level + 1"
    />
  </template>
</template>

<style lang="scss" scoped>
.table-row {
  display: grid;
  background-color: #fff;
  border-bottom: 1px solid rgb(121, 121, 121);

  &.category {
    font-weight: 700;
    position: sticky;
    top: calc(32px * v-bind(level));
  }
}

.table-cell {
  @include table-cell;
}
</style>
