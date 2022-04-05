<script>
import { mapGetters } from 'vuex'
import NavigationLink from './NavigationLink.vue'

export default {
  components: { NavigationLink },
  computed: {
    ...mapGetters('directory', ['directories']),
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
        delimeter: true,
      }
      const links = this.parentTree.map((item, index, arr) => ({
        text: item.name,
        url: `/directories/${item._id}`,
        delimeter: index !== arr.length - 1,
      }))

      return [root, ...links]
    },
  },
  methods: {
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
  <div class="links">
    <NavigationLink
      v-for="link in links"
      :key="link.url"
      :url="link.url"
      :delimeter="link.delimeter"
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
}
</style>
