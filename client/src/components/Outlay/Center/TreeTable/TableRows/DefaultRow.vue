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
      type: String,
      required: true,
    },
  },
  emits: ['clone'],
  computed: {
    ...mapGetters('outlay', ['keys']),
  },
}
</script>

<template>
  <ViewCell v-for="key in keys" :key="key.id" :value="node.data[key.id]" />
  <ViewCell :value="sum" />
  <DefaultActions @clone="$emit('clone')" />
</template>
