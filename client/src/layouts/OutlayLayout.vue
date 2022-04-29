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
    const outlay = this.outlays.find(out => out._id === this.outlayId)
    if (!outlay) {
      return
    }
    const edition = this.editions.find(e => e._id === outlay.edition)
    const activeData = JSON.parse(JSON.stringify(edition))
    const nodeList = activeData.data.children
      .map(c => this.treeToList(c, 0, []))
      .flat()
    const roots = nodeList.filter(n => this.isObjectId(n.key))
    this.setActiveData(edition)
    this.setRoots(roots)
    this.setNodeList(nodeList)
    this.setOutlay(outlay)
  },
  methods: {
    ...mapMutations('outlay', [
      'setOutlay',
      'setActiveData',
      'setNodeList',
      'setRoots',
    ]),
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
  <main v-if="outlay" class="main">
    <LeftSide />
    <CenterWrapper />
    <RightSide />
  </main>
  <span v-else> Смета не найдена </span>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: min-content 1fr min-content;
}
</style>
