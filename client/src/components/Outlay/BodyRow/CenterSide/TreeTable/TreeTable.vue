<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import TableRow from './TableRow.vue'
import rowColors from '@/mixins/tableRowColors.mixin'

import emitter from '@/modules/eventBus'

export default {
  components: {
    TableRow,
  },
  mixins: [rowColors],
  data() {
    return {
      category: null,
      subCategory: null,
      timeout: null,
      currentCategory: null,
      currentSubCategory: null,
      currentNodeIndex: 0,
      focused: true,
      vcoConfig: {
        handler: this.outsideClickHandler,
        events: ['click'],
      },
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
      if (this.showOnlyChecked) {
        return this.currentRoomData.filter(n =>
          this.selectedValues.includes(n.key),
        )
      }
      return this.currentRoomData
    },
    nodes() {
      const nodes = this.tableData.map(this.treeToListOnlyValues).flat()
      if (!this.showOnlyChecked) {
        return nodes
      }
      return nodes.filter(n => this.selectedValues.includes(n.key))
    },
    categories() {
      return this.tableData
    },
    subCategories() {
      const subCategories = this.tableData.map(this.getSubCategories).flat()
      if (this.showOnlyChecked) {
        return subCategories.filter(n => this.selectedValues.includes(n.key))
      }
      return subCategories
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
      this.initObserver()
      this.currentNodeIndex = 0
      const currentNode = this.nodes[this.currentNodeIndex]
      this.setCurrentNode(currentNode)
    },
    showOnlyChecked() {
      this.initObserver()
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
    this.initObserver()
    this.setCurrentNode(this.nodes[this.currentNodeIndex])
    emitter.$on('scrollTo', key => {
      this.scrollTo(key)
      this.setCurrentNodeByKey(key)
    })
    emitter.$on('selectNode', this.setCurrentNodeByKey)
    document.addEventListener('keydown', this.keyHandler)
  },
  unmounted() {
    emitter.$off('scrollTo')
    emitter.$off('hideRow')
    emitter.$off('selectNode')
    document.removeEventListener('keydown', this.keyHandler)
  },
  methods: {
    ...mapMutations('outlay', ['selectJob', 'setCurrentNode']),
    ...mapMutations('outlays', ['updateById']),
    ...mapActions('outlay', ['saveLocaly']),
    outsideClickHandler() {
      this.focused = false
    },
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (this.isObjectId(key)) {
        return childs
      }

      return [node]
    },
    getSubCategories(node) {
      const { children } = node
      if (children && children.length > 0) {
        if (children[0].children.length === 0) {
          return [node]
        }
        return node.children.map(this.getSubCategories).flat()
      }
      return []
    },
    setCurrentCategory(e, id) {
      const categoryIndex = this.tableData.findIndex(node => node.key === id)
      if (e.isIntersecting) {
        if (categoryIndex === 0) {
          return (this.currentCategory = null)
        }
        this.currentCategory = this.tableData[categoryIndex - 1]
        return
      }
      this.currentCategory = this.tableData[categoryIndex]
      return
    },
    setCurrentSubCategory(e, id) {
      const newIndex = this.subCategories.findIndex(c => c.key === id)
      if (e.isIntersecting) {
        this.currentSubCategory = this.subCategories[newIndex - 1]
        return
      }
      this.currentSubCategory = this.subCategories[newIndex]
    },
    async initObserver() {
      this.currentCategory = null
      this.currentSubCategory = null
      await this.$nextTick()
      const { wrapper } = this.$refs
      if (!wrapper) {
        return
      }
      wrapper.scrollTo({ top: 0 })
      const parents = wrapper.querySelectorAll('.parent')
      const observer = new IntersectionObserver(
        entries => {
          const { wrapper } = this.$refs
          if (!wrapper) {
            return
          }
          if (wrapper.scrollTop === 0) {
            if (this.categories.length === 0) {
              return
            }
            emitter.$emit('hideRow', this.categories[0]?.key)
            emitter.$emit('hideRow', this.subCategories[0]?.key)
            this.currentCategory = this.categories[0]
            this.currentSubCategory = this.subCategories[0]
            return
          }

          const { top, height } = wrapper.getBoundingClientRect()
          entries.forEach(e => {
            if (e.boundingClientRect.top - top > height / 2) {
              return
            }
            const id = e.target.dataset?.id
            const level = +e.target.dataset?.level
            if (level === 0) {
              return this.setCurrentCategory(e, id)
            }
            if (level > 0) {
              return this.setCurrentSubCategory(e, id)
            }
          })
        },
        {
          threshold: 1,
        },
      )
      parents.forEach(r => {
        observer.observe(r)
      })
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
      if (this.showOnlyChecked) {
        return this.selectNode(nodeKey)
      }
      const { wrapper } = this.$refs
      if (!wrapper) return
      const row = wrapper.querySelector(`.table-row[data-id="${nodeKey}"]`)
      if (!row) {
        return
      }
      wrapper.scrollTo({
        top: row.offsetTop,
        behavior: smooth ? 'smooth' : 'instant',
      })
    },
    scrollToAndSelect(nodeKey) {
      this.scrollTo(nodeKey)
      this.selectNode(nodeKey)
    },
    selectNode(nodeKey) {
      const parents = this.roomsData[this.selectedRoom.id]
        .map(n => this.getNodeFromTree(n, nodeKey, []))
        .flat()
      parents.forEach(this.selectJob)
    },
    setCurrentNodeByKey(key) {
      const index = this.nodes.findIndex(n => n.key === key)
      if (index < 0) return
      this.currentNodeIndex = index
      this.setCurrentNode(this.nodes[index])
    },
    keyHandler(e) {
      if (!this.focused) return
      const { key } = e
      const avaliableKeys = ['ArrowUp', 'ArrowDown']
      if (!this.currentNode) return

      if (key === 'ArrowRight') {
        return emitter.$emit('editQuantity', this.currentNode.key)
      }
      if (key === 'ArrowLeft' || key === 'Enter') {
        return emitter.$emit('stopEditQuantity', this.currentNode.key)
      }
      if (!avaliableKeys.includes(key)) {
        return
      }
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
      const { height } = wrapper.getBoundingClientRect()
      const currentNode = this.nodes[this.currentNodeIndex]
      const domNode = wrapper.querySelector(
        `.table-row[data-id="${currentNode.key}"]`,
      )
      const { offsetTop, clientHeight } = domNode
      if (offsetTop + clientHeight - wrapper.scrollTop >= height) {
        const top = offsetTop - height + clientHeight
        wrapper.scrollTo({
          top,
        })
      }
      if (offsetTop + clientHeight - wrapper.scrollTop < clientHeight) {
        this.scrollTo(currentNode.key, false)
      }
      this.setCurrentNode(currentNode)
    },
  },
}
</script>
<template>
  <div class="tree-table">
    <div class="table-grid">
      <div
        v-if="currentCategory"
        class="table-grid__header"
        :style="[headerStyle, `backgroundColor: ${colors[0]}`]"
      >
        <div
          v-for="key in tableKeys"
          :key="key.id"
          :title="key.name"
          class="table-grid__cell"
        >
          <span>
            {{ key.name }}
          </span>
        </div>
        <div class="table-grid__cell">Сумма</div>
      </div>
      <div
        v-if="currentSubCategory"
        class="table-grid__header"
        :style="[headerStyle, `backgroundColor: ${colors[1]}`]"
      >
        <div class="table-grid__cell">
          {{ currentSubCategory.data[keys[0].id] }}
        </div>
      </div>
      <div class="table-grid__body" ref="wrapper">
        <TableRow
          v-for="(node, index) in tableData"
          :key="node.key"
          :node="node"
          :level="0"
          :index="index"
          :style="headerStyle"
        />
      </div>
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
