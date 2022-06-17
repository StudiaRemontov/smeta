<script>
import ActItem from './ActItem.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    ActItem,
  },
  data() {
    return {
      selectedItem: null,
    }
  },
  computed: {
    ...mapGetters('acts', ['acts']),
    actList() {
      return [...this.acts].reverse()
    },
  },
  methods: {
    openMenu() {},
  },
}
</script>

<template>
  <div v-if="acts && acts.length > 0" class="act-list">
    <ActItem
      v-for="act in actList"
      :key="act._id"
      :act="act"
      @open-menu="openMenu"
    />
  </div>
</template>

<style lang="scss" scoped>
.act-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  overflow-y: hidden;
  @include darkScroll;
}
</style>
