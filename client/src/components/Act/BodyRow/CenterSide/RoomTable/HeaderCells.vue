<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    title: String,
    level: Number,
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
    cells() {
      const keys = [
        ...this.keys,
        {
          id: 'Осталось',
          name: 'Осталось',
        },
      ]

      if (this.title) {
        return keys.map((k, index) => {
          if (index == 0) {
            return {
              ...k,
              name: this.title,
            }
          }
          return k
        })
      }
      return keys
    },
  },
}
</script>

<template>
  <div v-for="(cell, index) in cells" :key="cell.id" class="table-cell">
    <span v-if="index === 0">
      {{ cell.name }}
    </span>
    <template v-else>
      {{ cell.name }}
    </template>
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
