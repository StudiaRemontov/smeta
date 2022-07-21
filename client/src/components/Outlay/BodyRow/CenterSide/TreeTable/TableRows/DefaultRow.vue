<script>
import { mapGetters } from 'vuex'
import DefaultActions from '../TableCells/DefaultActions.vue'
import ViewCell from '../TableCells/ViewCell.vue'

import { formatNumber } from '@/helpers/formatNumber'

export default {
  components: { DefaultActions, ViewCell },
  props: {
    node: {
      type: Object,
      default() {
        return {}
      },
    },
    sum: {
      type: Number,
      required: true,
    },
  },
  emits: ['clone'],
  computed: {
    ...mapGetters('outlay', ['keys', 'priceKey', 'quantityKey']),
    viewData() {
      const formattedKeys = [this.quantityKey.id, this.priceKey.id]
      const { data } = this.node
      return this.keys.map(key => {
        const { id } = key
        if (!formattedKeys.includes(id)) {
          return {
            key: id,
            value: data[id],
          }
        }

        const value = formatNumber(data[id])

        if (id === this.priceKey.id) {
          const { coef } = this.node
          const priceValue =
            coef > 1 ? `${value} (${formatNumber(coef)})` : value
          return {
            key: id,
            value: priceValue,
          }
        }
        return {
          key: id,
          value,
        }
      })
    },
  },
}
</script>

<template>
  <ViewCell
    v-for="(data, index) in viewData"
    :key="data.key"
    :value="data.value"
    :index="index"
  />
  <ViewCell :isSum="true" :value="sum" />
  <DefaultActions @clone="$emit('clone')" />
</template>
