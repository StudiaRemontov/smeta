<script>
import LeftSide from '@/components/Outlay/LeftSide.vue'
import CenterWrapper from '@/components/Outlay/CenterWrapper.vue'
import RightSide from '@/components/Outlay/RightSide.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    LeftSide,
    CenterWrapper,
    RightSide,
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
    ...mapGetters('outlays', ['outlays']),
    ...mapGetters('edition', ['editions']),
    outlayId() {
      return this.$route.params.id
    },
  },
  async mounted() {
    await this.fetchAll()
  },
  methods: {
    ...mapMutations('outlay', ['setActiveData', 'setNodeList', 'setRoots']),
    ...mapActions('outlays', ['fetchAll']),
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToList(node, level, list, parent = null) {
      const { key, children } = node
      node.level = level
      if (parent) {
        node.parent = parent
      }
      if (children && children.length > 0) {
        if (key)
          return [
            node,
            ...node.children
              .map(c => this.treeToList(c, level + 1, list, key))
              .flat(),
          ]
      }
      return [...list, node]
    },
  },
}
</script>

<template>
  <main class="main">
    <LeftSide />
    <CenterWrapper />
    <RightSide />
  </main>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: min-content 1fr min-content;
}
</style>
