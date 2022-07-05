<script>
import { computed } from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import TableGroup from '../TreeTableView/TableGroup.vue'

import emitter from '@/modules/eventBus'
import { opacityGenerator } from '@/helpers/opacityGenerator'

export default {
  components: {
    TableGroup,
  },
  provide() {
    return {
      editable: true,
      opacities: computed(() => this.opacities),
    }
  },
  data() {
    return {
      category: null,
      subCategory: null,
      timeout: null,
      currentCategory: null,
      currentSubCategory: null,
      currentNodeIndex: 0,
      opacities: [],
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'keys',
      'showOnlyChecked',
      'selectedRoom',
      'outlay',
      'currentRoomData',
      'selectedValues',
      'priceKey',
      'roomsData',
      'rooms',
      'currentNode',
      'quantityKey',
    ]),
    tableKeys() {
      if (!this.keys) return []
      return this.keys.map((k, index) => {
        if (index === 0 && this.currentCategory) {
          return {
            ...k,
            name: this.currentCategory.data[this.keys[0].id],
          }
        }
        return k
      })
    },
    tableData() {
      if (!this.selectedRoom) {
        return []
      }
      const children = this.showOnlyChecked
        ? this.currentRoomData.filter(n => this.selectedValues.includes(n.key))
        : this.currentRoomData

      return [
        {
          key: this.selectedRoom.id,
          data: {
            [this.keys[0].id]: this.selectedRoom.name,
          },
          room: true,
          children,
        },
      ]
    },
    nodes() {
      const nodes = this.tableData.map(this.treeToListOnlyValues).flat()
      if (!this.showOnlyChecked) {
        return nodes
      }
      return nodes.filter(n => this.selectedValues.includes(n.key))
    },
    headerStyle() {
      const keysLength = this.tableKeys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr)) 50px`,
      }
    },
  },
  watch: {
    selectedRoom() {
      this.currentNodeIndex = 0
      const currentNode = this.nodes[this.currentNodeIndex]
      this.setCurrentNode(currentNode)
    },
    currentRoomData: {
      handler() {
        if (this.selectedRoom) {
          this.save()
        }
      },
      deep: true,
    },
    'selectedValues.length'() {
      if (this.selectedRoom) {
        this.save()
      }
    },
  },
  async mounted() {
    this.setCurrentNode(this.nodes[this.currentNodeIndex])
    emitter.$on('scrollTo', key => {
      this.scrollTo(key)
      this.setCurrentNodeByKey(key)
    })
    emitter.$on('selectNode', this.setCurrentNodeByKey)
    document.addEventListener('keydown', this.keyHandler)
    const depths = this.tableData.map(d => this.getTreeDepth(d, 0))
    const maxDepth = Math.max(...depths)
    const depth = maxDepth
    this.opacities = opacityGenerator(depth)
  },
  unmounted() {
    emitter.$off('scrollTo')
    emitter.$off('selectNode')
    document.removeEventListener('keydown', this.keyHandler)
  },
  methods: {
    ...mapMutations('outlay', [
      'selectJob',
      'setCurrentNode',
      'toggleNodeEditing',
      'setNodeEditing',
    ]),
    ...mapMutations('outlays', ['updateById']),
    ...mapActions('outlay', ['saveLocaly', 'selectJob']),
    getTreeDepth(node, depth) {
      const { children } = node
      let result = depth
      if (children && children.length > 0) {
        const depths = children.map(c => this.getTreeDepth(c, depth + 1))
        const max = Math.max(...depths)
        result = max
      }
      return result
    },
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToListOnlyValues(node) {
      const { children, key, room } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (this.isObjectId(key) || room) {
        return childs
      }

      return [node]
    },
    save() {
      if (this.timeout) {
        this.timeout = clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(async () => {
        await this.saveLocaly()
      }, 500)
    },
    getNodeFromTree(node, nodeKey, parents) {
      const { key, children } = node
      if (key === nodeKey) {
        return [...parents, node]
      }
      return children
        .map(c => this.getNodeFromTree(c, nodeKey, [...parents, node]))
        .flat()
    },
    scrollTo(nodeKey, smooth = true) {
      const { wrapper } = this.$refs
      if (!wrapper) return
      const tableData = wrapper.getBoundingClientRect()
      const row = wrapper.querySelector(`.table-row[data-id="${nodeKey}"]`)
      if (!row) {
        return
      }
      const rowData = row.getBoundingClientRect()
      const level = +row.dataset.level
      const stickyRowsHeight = level * 32
      const offsetFromTable = rowData.top - tableData.top - stickyRowsHeight
      wrapper.scrollTo({
        top: offsetFromTable + wrapper.scrollTop,
        behavior: smooth ? 'smooth' : 'instant',
      })
    },
    scrollToAndSelect(node) {
      const { key } = node
      this.scrollTo(key)
      this.selectNode(node)
    },
    selectNode(node) {
      this.selectJob(node)
      this.setCurrentNodeByKey(node.key)
    },
    setCurrentNodeByKey(key) {
      const index = this.nodes.findIndex(n => n.key === key)
      if (index < 0) return
      this.currentNodeIndex = index
      this.setCurrentNode(this.nodes[index])
    },
    keyHandler(e) {
      const { key, code } = e
      const path = e.composedPath()
      const controlledElementTags = ['INPUT', 'TEXTAREA', 'SELECT']
      const isBubblesFromController = path.find(e =>
        controlledElementTags.includes(e.tagName),
      )
      if (isBubblesFromController) {
        return
      }
      if (key !== 'F12' && key !== 'F5') {
        e.preventDefault()
      }
      const isAnyModalOppened = document.querySelector('.popup-modal')
      if (isAnyModalOppened) {
        return
      }
      if (!this.currentNode) return

      if (code === 'Space') {
        this.selectJob(this.currentNode)
        if (!this.showOnlyChecked) return
        if (this.currentNodeIndex >= this.nodes.length - 1) {
          this.currentNodeIndex = this.nodes.length - 1
        }
        const currentNode = this.nodes[this.currentNodeIndex]
        return this.setCurrentNode(currentNode)
      }
      if (key === 'ArrowRight') {
        return this.toggleNodeEditing(this.currentNode)
      }
      if (key === 'ArrowLeft' || key === 'Enter') {
        return this.setNodeEditing({ node: this.currentNode, value: false })
      }
      const avaliableKeys = ['ArrowUp', 'ArrowDown']
      if (!avaliableKeys.includes(key)) {
        return
      }
      //refresh
      this.setCurrentNodeByKey(this.currentNode.key)
      if (key === avaliableKeys[0]) {
        if (this.currentNodeIndex <= 0) {
          return (this.currentNodeIndex = 0)
        }
        this.currentNodeIndex--
      }
      if (key === avaliableKeys[1]) {
        if (this.currentNodeIndex >= this.nodes.length - 1) {
          return (this.currentNodeIndex = this.nodes.length - 1)
        }
        this.currentNodeIndex++
      }
      const { wrapper } = this.$refs
      const tableData = wrapper.getBoundingClientRect()
      const currentNode = this.nodes[this.currentNodeIndex]
      const domNode = wrapper.querySelector(
        `.table-row[data-id="${currentNode.key}"]`,
      )
      const rowData = domNode.getBoundingClientRect()
      const { clientHeight } = domNode
      const level = +domNode.dataset.level
      const stickyRowsHeight = level * 32
      const offsetFromTable = rowData.top - tableData.top - stickyRowsHeight
      const tableHeight = tableData.height - stickyRowsHeight
      if (offsetFromTable + clientHeight >= tableHeight) {
        const top =
          offsetFromTable - tableHeight + wrapper.scrollTop + clientHeight

        wrapper.scrollTo({
          top,
        })
      }

      if (offsetFromTable + clientHeight < clientHeight) {
        this.scrollTo(currentNode.key, false)
      }
      this.setCurrentNode(currentNode)
    },
  },
}
</script>
<template>
  <div class="tree-table">
    <div class="table-grid__body" ref="wrapper">
      <TableGroup
        v-for="(node, index) in tableData"
        :key="node.key"
        :node="node"
        :level="0"
        :index="index"
        :style="headerStyle"
        isRoom
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-table {
  display: flex;
  flex-direction: column;
  min-height: 0px;
}

.table-grid {
  display: flex;
  flex-direction: column;
  min-height: 0px;

  &__header &__cell {
    color: $color-light;
  }

  &__header,
  &__row {
    display: grid;
  }

  &__body {
    flex: 1;
    @include darkScroll;
    overflow-y: overlay;
    position: relative;
  }

  &__cell {
    @include table-cell;
  }
}
</style>
