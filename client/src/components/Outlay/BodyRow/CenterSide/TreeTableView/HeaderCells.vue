<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    title: String,
    level: Number,
  },
  emits: ['name-click'],
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
  methods: {
    nameClick() {
      this.$emit('name-click')
    },
  },
}
</script>

<template>
  <div v-for="(cell, index) in cells" :key="cell.id" class="table-cell">
    <span v-if="index === 0" @click="nameClick">
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
  text-transform: lowercase;
}
</style>
