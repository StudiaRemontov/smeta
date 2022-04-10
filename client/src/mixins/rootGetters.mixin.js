export default {
  methods: {
    getRoot(parentId) {
      const parent = this.directories.find(d => d._id === parentId)

      if (parent?.parent) {
        return this.getRoot(parent.parent)
      }

      return parent
    },
    getTree(directory) {
      const parent = this.directories.find(d => d._id === directory)
      if (!parent) {
        return []
      }
      if (parent.parent) {
        return [...this.getTree(parent.parent), parent]
      }

      return [parent]
    },
  },
}
