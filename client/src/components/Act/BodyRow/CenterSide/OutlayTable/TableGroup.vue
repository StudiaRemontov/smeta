<script>
import { mapActions, mapGetters } from 'vuex'
import JobList from './JobList.vue'
import HeaderCells from './HeaderCells.vue'

import { isObjectId } from '@/helpers/isObjectId'
import { formatNumber } from '@/helpers/formatNumber'

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
    level: Number,
    room: String,
    isRoom: Boolean,
  },
  computed: {
    ...mapGetters('outlay', [
      'keys',
      'priceKey',
      'selectedValues',
      'selectedRoom',
      'showOnlyChecked',
      'selectedValues',
    ]),
    data() {
      return this.node.data
    },
    title() {
      return this.node.data[this.keys[0].id]
    },
    children() {
      if (this.showOnlyChecked) {
        return this.node.children.filter(n =>
          this.selectedValues.includes(n.key),
        )
      }
      return this.node.children || []
    },
    isCategory() {
      return this.children.length > 0
    },
    categories() {
      return this.children.filter(c => {
        const { children } = c
        return children && children.length > 0
      })
    },
    sum() {
      const allNodes = this.node.children.map(this.treeToListOnlyValues).flat()
      if (this.selectedRoom) {
        const selected = allNodes.filter(n =>
          this.selectedValues.includes(n.key),
        )
        const sum = selected.reduce((acc, node) => {
          const { data } = node
          const price = data[this.priceKey.id] * data.quantity
          return acc + price
        }, 0)
        return formatNumber(sum)
      }
      const sum = allNodes.reduce((acc, node) => {
        const { data } = node
        const price = data[this.priceKey.id] * data.quantity
        return acc + price
      }, 0)
      return formatNumber(sum)
    },
    result() {
      return `Итого по ${this.isRoom ? 'помещению' : 'разделу'} (${this.title})`
    },
    resultsRowStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `${4 + keysLength - 1}fr minmax(100px, 1fr)`,
      }
    },
    categoryRowStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) ${
          this.selectedRoom ? '50px' : ''
        }`,
      }
    },
  },
  methods: {
    ...mapActions('outlay', ['toggleCategoryJobs']),
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (isObjectId(key)) {
        return childs
      }

      return [node]
    },
  },
}
</script>

<template>
  <div class="table-group">
    <div v-if="isRoom" class="title-row">
      {{ title }}
    </div>
    <div v-else class="table-row table-row--category" :style="categoryRowStyle">
      <HeaderCells :title="title" />
    </div>
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
    <div class="results-row" :style="resultsRowStyle">
      <div class="table-cell table-cell--results">
        {{ result }}
      </div>
      <div class="table-cell" :title="sum">{{ sum }}</div>
    </div>
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
    text-align: center;
    color: #ffffff;
    z-index: calc(10 - v-bind(level));
  }

  &--results {
    @include table-cell;
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
  @include table-cell;
  text-align: left;

  &--results {
    text-align: right;
  }
}
</style>
