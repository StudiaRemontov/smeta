<script>
import { mapGetters } from 'vuex'
import DefaultActions from '../TableCells/DefaultActions.vue'
import ViewCell from '../TableCells/ViewCell.vue'

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
    ...mapGetters('outlay', ['keys', 'priceKey']),
  },
}
</script>

<template>
  <ViewCell
    v-for="(key, index) in keys"
    :key="key.id"
    :keyData="key"
    :value="
      key.id === priceKey.id
        ? `${node.data[key.id]} (${node.coef})`
        : node.data[key.id]
    "
    :index="index"
  />
  <ViewCell :isSum="true" :value="sum" />
  <DefaultActions @clone="$emit('clone')" />
</template>
