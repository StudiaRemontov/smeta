<script>
import { mapGetters } from 'vuex'
import JobList from './JobList.vue'
import HeaderCells from './HeaderCells.vue'

export default {
  name: 'TableGroup',
  components: {
    JobList,
    HeaderCells,
  },
  props: {
    node: {
      type: Object,
      required: true,
      default: () => {},
    },
    room: String,
    level: Number,
    isAct: Boolean,
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
    ...mapGetters('acts', ['showOnlyCompleted', 'completedValues']),
    data() {
      return this.node.data
    },
    title() {
      return this.data[this.keys[0].id]
    },
    children() {
      if (this.showOnlyCompleted) {
        return this.node.children.filter(n =>
          this.completedValues[this.room].includes(n.key),
        )
      }
      return this.node.children || []
    },
    categories() {
      return this.children.filter(c => {
        const { children } = c
        return children && children.length > 0
      })
    },
  },
}
</script>

<template>
  <div class="table-group">
    <div v-if="isAct" class="title-row">
      {{ title }}
    </div>
    <div v-else class="table-row table-row--category">
      <HeaderCells />
    </div>
    <template v-if="isAct && children.length > 0">
      <TableGroup
        v-for="category in children"
        :key="category.key"
        :node="category"
        :level="level + 1"
        :room="room"
      />
    </template>
    <template v-else>
      <template v-if="categories.length > 0">
        <JobList
          v-for="child in children"
          :key="child.key"
          :node="child"
          :level="level + 1"
          :room="room"
        />
      </template>
      <template v-else>
        <JobList
          :node="node"
          :level="level + 1"
          :room="room"
          :hasTitle="false"
        />
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.table-group {
  position: relative;
}

.table-row {
  display: grid;
  background-color: #fff;
  font-weight: 700;
  position: sticky;
  top: calc(32px * v-bind(level));
  height: 32px;

  &--category {
    background-color: $table-category-color;
    font-weight: 400;
    color: #ffffff;
    z-index: calc(10 - v-bind(level));
    grid-template-columns: 1fr 1fr;
  }

  &--results {
    @include act-table-cell;
    font-weight: 700;
  }
}

.title-row {
  position: sticky;
  top: calc(32px * v-bind(level));
  z-index: calc(10 - v-bind(level));
  padding: 8px;
  height: 32px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  line-height: 19px;
  background-color: $table-color-room;
}

.results-row {
  text-align: right;
  background-color: rgb(232, 232, 232);
  display: grid;
  padding: 0;
  font-weight: 700;
}

.table-cell {
  @include act-table-cell;
  text-align: left;

  &--results {
    text-align: right;
  }
}
</style>
