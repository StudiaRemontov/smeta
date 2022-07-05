<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {}
      },
    },
    level: {
      type: Number,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
    cells() {
      const firstKey = this.keys[0].id
      const name = this.data[firstKey]
      const categoryKey = {
        id: firstKey,
        name,
      }
      if (this.level === 0) {
        const mainKeys = this.keys.map((key, index) => {
          if (index === 0) {
            return categoryKey
          }
          return key
        })
        return [...mainKeys, { id: 'Сумма', name: 'Сумма' }]
      }
      return [categoryKey]
    },
  },
}
</script>

<template>
  <div
    v-for="cell in cells"
    :key="cell.id"
    class="table-cell"
    :class="{ nowrap: cells.length === 1 }"
  >
    {{ cell.name }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;

  &.nowrap {
    overflow: visible;
    white-space: nowrap;
  }
}
</style>
