<script>
import { mapGetters } from 'vuex'

import { getValuesInside } from '@/store/modules/outlay.module'
import { formatNumber } from '@/helpers/formatNumber'

import RowWrapper from './RowWrapper.vue'
import CellWrapper from './CellWrapper.vue'

import JobList from './JobList.vue'
export default {
  components: {
    JobList,
    RowWrapper,
    CellWrapper,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
    title() {
      return this.node.data[this.keys[0].id]
    },
    categoryKeys() {
      return this.keys.map((k, index) => {
        if (index === 0) {
          return {
            ...k,
            name: this.title,
          }
        }
        return k
      })
    },
    children() {
      return this.node.children
    },
    sum() {
      const nodes = getValuesInside(this.node).flat()
      const total = nodes.reduce((acc, node) => {
        const { data } = node
        const sum = data[this.quantityKey.id] * data[this.priceKey.id]
        acc += sum
        return acc
      }, 0)

      return formatNumber(total)
    },
  },
}
</script>

<template>
  <RowWrapper category bold>
    <CellWrapper
      v-for="(key, index) in categoryKeys"
      :key="key.id"
      :category="index === 0"
    >
      {{ key.name }}
    </CellWrapper>
    <CellWrapper> Сумма </CellWrapper>
  </RowWrapper>
  <JobList v-for="item in children" :key="item.key" :node="item" />
  <RowWrapper results>
    <CellWrapper result :colspan="keys.length">
      Итого по разделу ({{ title }})
    </CellWrapper>
    <CellWrapper result>{{ sum }}</CellWrapper>
  </RowWrapper>
</template>
