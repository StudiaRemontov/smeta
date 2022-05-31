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
          id: 'Сумма',
          name: 'Сумма',
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
  <div v-for="cell in cells" :key="cell.id" class="table-cell">
    {{ cell.name }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
