<script>
import { mapGetters, mapMutations } from 'vuex'
import NavigationLink from './NavigationLink.vue'

export default {
  components: { NavigationLink },
  computed: {
    ...mapGetters('directory', ['directories', 'loading']),
    directoryId() {
      return this.$route.params.id
    },
    directory() {
      if (!this.directoryId) {
        return null
      }

      return this.directories.find(
        directory => directory._id === this.directoryId,
      )
    },
    parentTree() {
      if (!this.directory) {
        return []
      }

      return this.getParentTree(this.directory)
    },
    links() {
      const root = {
        text: 'Справочники',
        url: '/directories',
      }
      const links = this.parentTree.map(item => ({
        text: item.name,
        url: `/directories/${item._id}`,
      }))

      return [root, ...links]
    },
  },
  watch: {
    parentTree: {
      handler(tree) {
        if (tree.length === 0) {
          return this.setRoot(null)
        }
        const root = tree[0]
        this.setRoot(root._id)
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations('directory', ['setRoot']),
    getParentTree(directory) {
      if (directory.parent) {
        const parent = this.directories.find(
          ({ _id }) => _id === directory.parent,
        )
        return [...this.getParentTree(parent), directory]
      }
      return [directory]
    },
  },
}
</script>
<template>
  <div class="links" :class="{ disabled: loading }">
    <NavigationLink
      v-for="(link, index) in links"
      :key="link.url"
      :url="link.url"
      :delimeter="index !== links.length - 1"
      :text="link.text"
    />
  </div>
</template>

<style lang="scss" scoped>
.links {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
