<script>
import ActionList from './LeftSide/ActionList.vue'
import TabList from './LeftSide/TabList.vue'
import CollapseBlock from '../../Act/BodyRow/LeftSide/CollapseBlock.vue'
import { mapMutations } from 'vuex'

export default {
  components: {
    CollapseBlock,
    ActionList,
    TabList,
  },
  computed: {
    showLeftSide: {
      get() {
        return this.$store.getters['outlay/showLeftSide']
      },
      set(value) {
        return this.setShowLeftSide(value)
      },
    },
  },
  methods: {
    ...mapMutations('outlay', ['setShowLeftSide']),
  },
}
</script>

<template>
  <div class="wrapper">
    <CollapseBlock v-model="showLeftSide" />
    <ActionList />
    <TabList />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
</style>
