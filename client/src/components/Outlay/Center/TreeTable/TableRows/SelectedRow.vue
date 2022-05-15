<script>
import { mapGetters } from 'vuex'
import DefaultActions from '../TableCells/DefaultActions.vue'
import ViewCell from '../TableCells/ViewCell.vue'
import PriceCell from '../TableCells/Seletcted/PriceCell.vue'
import QuantityCell from '../TableCells/Seletcted/QuantityCell.vue'

import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: { DefaultActions, ViewCell, PriceCell, QuantityCell },
  mixins: [keyTypes],
  props: {
    node: {
      type: Object,
      default() {
        return {}
      },
    },
    sum: {
      type: String,
      required: true,
    },
  },
  emits: ['clone'],
  computed: {
    ...mapGetters('directory', ['directories']),
    ...mapGetters('outlay', ['keys', 'edition']),
    data() {
      return this.node.data
    },
    keysWithType() {
      return this.keys.map(key => {
        const directory = this.directories.find(
          d => d._id === this.edition.dirId,
        )
        const dirKey = directory.keys.find(k => k.id === key.id)
        const typedKey = this.keys.find(k => k.id === key.id)
        return {
          ...typedKey,
          type: dirKey.type,
        }
      })
    },
    type() {
      return this.key.type
    },
  },
}
</script>

<template>
  <template v-for="key in keysWithType" :key="key.id">
    <PriceCell v-if="key.type === InputType.PRICE" v-model="data[key.id]" />
    <QuantityCell
      v-else-if="key.type === InputType.QUANTITY"
      v-model="data[key.id]"
    />
    <ViewCell v-else :value="data[key.id]" />
  </template>
  <ViewCell :value="sum" />
  <DefaultActions @clone="$emit('clone')" />
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
