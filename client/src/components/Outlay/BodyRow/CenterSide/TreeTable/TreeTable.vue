<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import TableRow from './TableRow.vue'
import rowColors from '@/mixins/tableRowColors.mixin'

import { filterNodes } from '@/store/modules/outlay.module'
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
        const clone = JSON.parse(JSON.stringify(this.currentRoomData))
        return clone
          .filter(n => filterNodes(n, this.selectedValues))
          .filter(n => n.children.length > 0)
      }
      return this.currentRoomData
    },
    categories() {
      return this.tableData
    },
    subCategories() {
      return this.tableData.map(this.getSubCategories).flat()
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
  },
  methods: {
    ...mapMutations('outlay', ['selectJob']),
    ...mapMutations('outlays', ['updateById']),
    ...mapActions('outlay', ['saveLocaly']),
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
    scrollTo(nodeKey) {
      const { wrapper } = this.$refs
      const row = wrapper.querySelector(`.table-row[data-id="${nodeKey}"]`)
      wrapper.scrollTo({
        top: row.offsetTop,
        behavior: 'smooth',
      })
      const parents = this.roomsData[this.selectedRoom.id]
        .map(n => this.getNodeFromTree(n, nodeKey, []))
        .flat()
      parents.forEach(this.selectJob)
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
