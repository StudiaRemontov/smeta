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
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
  },
}
</script>

<template>
  <td class="table-cell" :colspan="keys.length + 2">
    {{ data[keys[0].id] }}
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
