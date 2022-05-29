<script>
import { mapGetters } from 'vuex'

import TableGroup from './TableGroup.vue'

import tableRowColors from '@/mixins/tableRowColors.mixin'

import { filterNodes } from '@/store/modules/outlay.module'

export default {
  components: { TableGroup },
  mixins: [tableRowColors],
  data() {
    return {
      currentRoom: null,
      currentCategory: null,
      currentSubCategory: null,
      subCategories: [],
      fixedCategories: {},
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'rooms',
      'selectedValues',
      'keys',
      'roomsData',
      'selectedRoom',
    ]),
    roomsList() {
      return [...this.rooms].reverse()
    },
    data() {
      if (!this.roomsData) {
        return []
      }
      const roomsData = Object.entries(this.roomsData)
      const reversed = [...roomsData].reverse()
      if (reversed.length === 0 || this.selectedRoom) return []
      return reversed.map(([key, values]) => {
        const foundRoom = this.rooms.find(acc => acc.id === key)
        const clone = JSON.parse(JSON.stringify(values))
        const children = clone
          .map(node => filterNodes(node, this.selectedValues[key]))
          .flat()

        if (!foundRoom) return {}
        return {
          key,
          data: {
            [this.keys[0].id]: foundRoom.name,
          },
          children,
          room: true,
          level: 0,
        }
      })
    },
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `4fr repeat(${keysLength}, minmax(100px, 1fr))`,
      }
    },
    nodes() {
      return this.data.map(n => this.treeToList(n, [])).flat()
    },
    groupedCategories() {
      return this.nodes.reduce((acc, node) => {
        acc[node.level] = acc[node.level] || []
        acc[node.level].push(node)
        return acc
      }, {})
    },
    treeDepth() {
      return Object.keys(this.groupedCategories).length
    },
    fixedView() {
      return Object.values(this.fixedCategories).map(v => {
        if (!v) {
          return {}
        }
        return {
          key: v.key,
          name: v.data[this.keys[0].id],
        }
      })
    },
  },
  watch: {
    roomsData: {
      handler() {
        this.initObserver()
      },
      immediate: true,
    },
  },
  methods: {
    treeToList(node, list) {
      const { children } = node
      if (children && children.length > 0) {
        if (children[0].children.length === 0) {
          return [node]
        }
        return [
          ...list,
          node,
          ...node.children.map(c => this.treeToList(c, list)).flat(),
        ]
      }
      return list
    },
    setLevels(node, level = 0) {
      const { children } = node

      if (children.length > 0) {
        node.level = level
        node.children = children.map(c => this.setLevels(c, level + 1))
      }
      return node
    },
    getSubCategories(node) {
      const { children } = node
      if (children.length > 0) {
        return [node, ...children.map(this.getSubCategories).flat()]
      }
      return []
    },
    setCurrentRoom(e, id) {
      const roomIndex = this.roomsList.findIndex(acc => acc.id === id)
      if (e.isIntersecting) {
        if (roomIndex === 0) {
          return
        }
        this.currentRoom = this.roomsList[roomIndex - 1]
        const roomId = this.currentRoom.id
        const lastCategoryIndex = this.currentRoom.jobs.length - 1
        this.currentCategory = this.currentRoom.jobs[lastCategoryIndex]
        const lastSubCategoryIndex = this.subCategories[roomId].length - 1
        this.currentSubCategory =
          this.subCategories[roomId][lastSubCategoryIndex]
        return
      }
      this.currentRoom = this.roomsList[roomIndex]
      return
    },
    setCurrentCategory(e, id) {
      const jobs = this.currentRoom?.jobs || []
      const categoryIndex = jobs.findIndex(node => node.key === id)
      if (e.isIntersecting) {
        if (categoryIndex === 0) {
          const roomIndex = this.roomsList.findIndex(
            acc => acc.id === this.currentRoom.id,
          )
          if (roomIndex > 0) {
            return
          }
          return
        }
        this.currentCategory = jobs[categoryIndex - 1]
        return
      }
      this.currentCategory = jobs[categoryIndex]
      return
    },
    setSubCategories(e, id) {
      if (!this.currentRoom || !this.subCategories[this.currentRoom.id]) return
      const newIndex = this.subCategories[this.currentRoom.id].findIndex(
        c => c.key === id,
      )
      if (e.isIntersecting) {
        if (newIndex === 0) {
          return
        }
        this.currentSubCategory =
          this.subCategories[this.currentRoom.id][newIndex - 1]
        return
      }
      this.currentSubCategory =
        this.subCategories[this.currentRoom.id][newIndex]
    },
    scrollTo(roomId, nodeKey) {
      const { wrapper } = this.$refs
      const row = wrapper.querySelector(
        `.table-row[data-room="${roomId}"][data-id="${nodeKey}"]`,
      )
      const level = +row.dataset.level
      const offsetTop = 32 * (level - 1)
      wrapper.scrollTo({
        top: row.offsetTop - offsetTop,
        behavior: 'smooth',
      })
    },
    setFixedCategory(level, categoryKey) {
      if (level > 0) {
        if (this.fixedCategories[level - 1]) {
          const category = this.fixedCategories[level - 1].children.find(
            n => n.key === categoryKey,
          )
          this.fixedCategories[level] = category
        }
      } else {
        const category = this.groupedCategories[level].find(
          n => n.key === categoryKey,
        )
        this.fixedCategories[level] = category
      }
      for (const key in this.fixedCategories) {
        if (+key > level) {
          delete this.fixedCategories[key]
        }
      }
    },
    getLastNodes(node) {
      const { children } = node
      if (children.length > 0 && children[0].children.length > 0) {
        return [
          children[children.length - 1],
          ...this.getLastNodes(children[children.length - 1]),
        ]
      }
      return []
    },
    async initObserver() {
      const nodesWithLevel = this.data.map(d => this.setLevels(d, 0))
      this.subCategories = nodesWithLevel.reduce((acc, n) => {
        const categories = this.getSubCategories(n)

        acc[n.key] = categories.filter(c => c.level > 1)
        return acc
      }, {})

      await this.$nextTick()
      const { wrapper } = this.$refs
      if (!wrapper) return
      wrapper.scrollTo(0, 0)
      const rows = wrapper.querySelectorAll(
        '.table-row.parent, .table-row.room',
      )
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (wrapper.scrollTop === 0) {
              return
            }
            const { top, height } = wrapper.getBoundingClientRect()
            if (e.boundingClientRect.top - top > height / 2) {
              return
            }
            const id = e.target.dataset?.id
            const level = +e.target.dataset?.level
            const index = this.groupedCategories[level].findIndex(
              n => n.key === id,
            )
            if (index < 0) {
              return
            }
            if (e.isIntersecting) {
              if (index > 0) {
                const category = this.groupedCategories[level][index - 1]
                this.setFixedCategory(level, category.key)
                const subCategories = this.getLastNodes(category).flat()
                subCategories.forEach(c =>
                  this.setFixedCategory(c.level, c.key),
                )
              } else {
                delete this.fixedCategories[level]
                return
              }

              return
            }
            const category = this.groupedCategories[level][index]
            return this.setFixedCategory(level, category.key)
          })
        },
        {
          root: wrapper,
          threshold: 1,
        },
      )
      rows.forEach(acc => {
        observer.observe(acc)
      })
    },
  },
}
</script>

<template>
  <div class="tree-table">
    <div class="table-grid">
      <div class="table-grid__body" ref="wrapper">
        <TableGroup
          v-for="node in data"
          :key="node.key"
          :node="node"
          :room="node.key"
          :level="0"
          isRoom
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

.room {
  background-color: $color-dark;
  height: 32px;
  padding: 8px;
  text-align: center;
  font-weight: 600;
}

.table-grid {
  display: flex;
  flex-direction: column;
  min-height: 0px;
  position: relative;

  &__categories {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: calc(32px * v-bind(treeDepth));
  }

  &__header &__cell {
    color: $color-light;
  }

  &__header,
  &__row {
    display: grid;
    color: #fff;
    left: 0;
    right: 0;
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

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.1s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
