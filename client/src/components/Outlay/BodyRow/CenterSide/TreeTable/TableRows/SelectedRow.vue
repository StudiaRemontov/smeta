<script>
import { mapGetters, mapMutations } from 'vuex'
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
      type: Number,
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
    coef: {
      get() {
        return this.node.coef
      },
      set(value) {
        this.setNodeCoef({ node: this.node, value })
      },
    },
  },
  methods: {
    ...mapMutations('outlay', [
      'setNodeEditing',
      'toggleNodeEditing',
      'setNodeCoef',
    ]),
    closeEditing() {
      this.setNodeEditing({ node: this.node, value: false })
    },
    quantityClick() {
      this.toggleNodeEditing(this.node)
    },
  },
}
</script>

<template>
  <template v-for="(key, index) in keysWithType" :key="key.id">
    <PriceCell
      v-if="key.type === InputType.PRICE"
      v-model="coef"
      :price="data[key.id]"
    />
    <QuantityCell
      v-else-if="key.type === InputType.QUANTITY"
      v-model="data[key.id]"
      ref="quantity"
      :isEditing="node.isEditing"
      @save="closeEditing"
      @click.stop="quantityClick"
    />
    <ViewCell v-else :value="data[key.id]" :index="index" :keyData="key" />
  </template>
  <ViewCell :value="sum" :isSum="true" />
  <DefaultActions @clone="$emit('clone')" />
</template>

<style lang="scss" scoped>
.table-cell {
  @include table-cell;
}
</style>
