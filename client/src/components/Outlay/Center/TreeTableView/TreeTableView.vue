<script>
import { mapGetters } from 'vuex'

import TableGridRow from './TableRow.vue'
import tableRowColors from '@/mixins/tableRowColors.mixin'

import { filterNodes } from '@/store/modules/outlay.module'

export default {
  components: { TableGridRow },
  mixins: [tableRowColors],
  data() {
    return {
      currentRoom: null,
      currentCategory: null,
      currentSubCategory: null,
      subCategories: [],
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
    data() {
      const roomsData = Object.entries(this.roomsData)
      if (roomsData.length === 0 || this.selectedRoom) return []
      return roomsData.map(([key, values]) => {
        const foundRoom = this.rooms.find(r => r.id === key)
        const clone = JSON.parse(JSON.stringify(values))
        const children = clone.map(node =>
          filterNodes(node, this.selectedValues[key]),
        )

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
      const roomIndex = this.rooms.findIndex(r => r.id === id)
      if (e.isIntersecting) {
        if (roomIndex === 0) {
          this.currentRoom = null
          this.currentCategory = null
          this.currentSubCategory = null
          return
        }
        this.currentRoom = this.rooms[roomIndex - 1]
        const roomId = this.currentRoom.id
        const lastCategoryIndex = this.currentRoom.jobs.length - 1
        this.currentCategory = this.currentRoom.jobs[lastCategoryIndex]
        const lastSubCategoryIndex = this.subCategories[roomId].length - 1
        this.currentSubCategory =
          this.subCategories[roomId][lastSubCategoryIndex]
        return
      }
      this.currentRoom = this.rooms[roomIndex]
      return
    },
    setCurrentCategory(e, id) {
      const jobs = this.currentRoom?.jobs || []
      const categoryIndex = jobs.findIndex(node => node.key === id)
      if (e.isIntersecting) {
        if (categoryIndex === 0) {
          const roomIndex = this.rooms.findIndex(
            r => r.id === this.currentRoom.id,
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
      wrapper.scrollTo({
        top: row.offsetTop,
        behavior: 'smooth',
      })
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
      const rows = wrapper.querySelectorAll(
        '.table-row.parent, .table-row.room',
      )
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            const { top, height } = wrapper.getBoundingClientRect()
            if (e.boundingClientRect.top - top > height / 2) {
              return
            }
            const id = e.target.dataset?.id
            const level = +e.target.dataset?.level
            if (level === 0) {
              return this.setCurrentRoom(e, id)
            }
            if (level === 1) {
              return this.setCurrentCategory(e, id)
            }
            if (level > 1) {
              return this.setSubCategories(e, id)
            }
          })
        },
        {
          root: wrapper,
          threshold: 1,
        },
      )
      rows.forEach(r => {
        observer.observe(r)
      })
    },
  },
}
</script>

<template>
  <div class="tree-table">
    <div v-if="currentRoom" class="room">
      {{ currentRoom.name }}
    </div>
    <div class="table-grid">
      <div
        v-if="currentCategory"
        class="table-grid__header"
        :style="[headerStyle, `backgroundColor: ${colors[0]}`]"
      >
        <div
          v-for="(key, index) in keys"
          :key="key.id"
          class="table-grid__cell"
        >
          <span
            v-if="index === 0 && currentCategory"
            :title="currentCategory.data[keys[0].id]"
          >
            {{ currentCategory.data[keys[0].id] }}
          </span>
          <span v-else :title="key.name">
            {{ key.name }}
          </span>
        </div>
        <div class="table-grid__cell" title="Сумма">Сумма</div>
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
        <TableGridRow
          v-for="node in data"
          :key="node.key"
          :node="node"
          :style="headerStyle"
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
  color: #fff;
  height: 32px;
  padding: 8px;
  text-align: center;
  font-weight: 600;
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
