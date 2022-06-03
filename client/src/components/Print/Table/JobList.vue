<script>
import { mapGetters } from 'vuex'
import TableRow from './TableRow.vue'
import RowWrapper from './RowWrapper.vue'
import CellWrapper from './CellWrapper.vue'

export default {
  components: { TableRow, RowWrapper, CellWrapper },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
    children() {
      return this.node.children
    },
    title() {
      if (this.children.length > 0) {
        return this.node.data[this.keys[0].id]
      }
      return null
    },
    visibleKeys() {
      return this.keys.map((k, index) => {
        if (index === 0 && this.title) {
          return this.title
        }
        return k.name
      })
    },
  },
}
</script>

<template>
  <RowWrapper v-if="title" bold>
    <CellWrapper v-for="key in visibleKeys" :key="key">
      {{ key }}
    </CellWrapper>
    <CellWrapper result>Сумма</CellWrapper>
  </RowWrapper>
  <TableRow v-else :node="node" />
  <TableRow v-for="item in children" :node="item" :key="item.key" />
</template>
