export default {
  data() {
    return {
      expandedKeys: {},
      expandedKeysLength: null,
      filters: {},
    }
  },
  methods: {
    expandAll() {
      for (const node of this.tree) {
        this.expandNode(node)
      }
      this.expandedKeys = { ...this.expandedKeys }
      this.expandedKeysLength = Object.keys(this.expandedKeys).length
    },
    expandNode(node) {
      if (node.children && node.children.length) {
        this.expandedKeys[node.key] = true

        for (const child of node.children) {
          this.expandNode(child)
        }
      }
    },
    filterHandler() {
      if (this.expandedKeysLength !== Object.keys(this.expandedKeys).length) {
        this.expandAll()
      }
    },
  },
}
