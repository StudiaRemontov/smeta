<script>
import { mapGetters } from 'vuex'
import TableRow from './Updated/TableRow.vue'

export default {
  name: 'TableGroup',
  components: {
    TableRow,
  },
  props: {
    node: {
      type: Object,
      required: true,
      default: () => {},
    },
    level: Number,
    room: String,
    isRoom: Boolean,
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
    data() {
      return this.node.data
    },
    title() {
      return this.node.data[this.keys[0].id]
    },
    children() {
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    result() {
      const sum = 0
      return `Итого по ${this.isRoom ? 'помещению' : 'разделу'} (${
        this.title
      }) ${sum}`
    },
  },
}
</script>

<template>
  <div class="table-group">
    <div class="title-row">{{ title }}</div>
    <template v-if="isRoom && children.length > 0">
      <TableGroup
        v-for="category in children"
        :key="category.key"
        :node="category"
        :level="level + 1"
        :room="room"
      />
    </template>
    <template v-else>
      <TableRow
        v-for="node in children"
        :key="node.key"
        :node="node"
        :level="level + 1"
        :room="room"
      />
    </template>
    <div class="results-row">
      {{ result }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.table-group {
  position: relative;
}

.title-row,
.results-row {
  @include table-cell;
  position: sticky;
  top: calc(32px * v-bind(level));
  font-weight: 700;
  border-bottom: 1px solid rgb(121, 121, 121);
}

.title-row {
  text-align: center;
  background-color: #ccc;
  z-index: calc(100 - v-bind(level));
}

.results-row {
  text-align: right;
  background-color: rgb(232, 232, 232);
}
</style>
