<script>
import { mapGetters } from 'vuex'

import TableGridRow from './TableGridRow.vue'
import tableRowColors from '@/mixins/tableRowColors.mixin'

export default {
  components: { TableGridRow },
  mixins: [tableRowColors],
  data() {
    return {
      tree: {},
      currentRootIndex: 0,
      currentRoom: null,
      currentCategory: null,
      currentSubCategory: null,
      subCategories: {},
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
      const data = roomsData.map(([key, values]) => {
        const foundRoom = this.rooms.find(r => r.id === key)
        if (!foundRoom) return {}
        const roomNode = {
          key,
          data: {
            [this.keys[0].id]: foundRoom.name,
          },
          children: [],
          room: true,
          level: 0,
        }

        const selectedNodes = values.filter(n =>
          this.selectedValues[key].includes(n.key),
        )
        const nodes = selectedNodes.map(n => ({ ...n, level: n.level + 1 }))
        return [roomNode, ...nodes]
      })
      return data.flat()
    },
    currentRoot() {
      return this.rooms[this.currentRootIndex]
    },
    tableKeys() {
      if (!this.keys) return []

      return this.keys.map((k, index) => {
        if (index === 0) {
          return {
            ...k,
            name: this.tree[1]?.data[this.keys[0].id] || 'Название',
          }
        }
        return k
      })
    },
    groupedList() {
      if (!this.data) return []
      return this.data.reduce((acc, cur) => {
        if (cur.room) {
          return acc
        }
        acc[cur['level']] = [...(acc[cur['level']] || []), cur]
        return acc
      }, {})
    },
    subCategoriesList() {
      return this.data.filter(d => d.level > 1 && d.children.length > 0)
    },
    treeView() {
      const filtered = Object.entries(this.tree).filter(([key]) => key > 1)
      return filtered.map(([_, n]) => n.data[this.keys[0].id])
    },
    headerStyle() {
      const keysLength = this.keys.length
      return {
        gridTemplateColumns: `1fr repeat(${keysLength}, 100px)`,
      }
    },
  },
  async mounted() {
    await this.$nextTick()
    const { row, wrapper } = this.$refs
    if (!row || !wrapper) return
    const rows = row.filter(r => r.isParent || r.isRoom)
    const domNodes = rows.map(r => r.$el)
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

    domNodes.forEach(r => {
      observer.observe(r)
    })
  },
  methods: {
    setCurrentRoom(e, id) {
      const roomIndex = this.rooms.findIndex(r => r.id === id)
      if (e.isIntersecting) {
        if (roomIndex === 0) {
          this.currentRoom = null
          return
        }
        this.currentRoom = this.rooms[roomIndex - 1]
        this.currentCategory =
          this.currentRoom.jobs[this.currentRoom.jobs.length - 1]
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
            this.currentRoom = this.rooms[roomIndex - 1]
            this.currentCategory =
              this.currentRoom.jobs[this.currentRoom.jobs.length - 1]
            return
          }
          this.currentCategory = null
          return
        }
        this.currentCategory = jobs[categoryIndex - 1]
        return
      }
      this.currentCategory = jobs[categoryIndex]
      return
    },
    setSubCategories(e, id) {
      if (!this.currentCategory) return
      const newIndex = this.subCategoriesList.findIndex(c => c.key === id)
      if (e.isIntersecting) {
        if (newIndex === 0) {
          this.currentSubCategory = null
          return
        }
        this.currentSubCategory = this.subCategoriesList[newIndex - 1]
        return
      }
      this.currentSubCategory = this.subCategoriesList[newIndex]
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
        class="table-grid__header"
        :style="[headerStyle, `backgroundColor: ${colors[0]}`]"
      >
        <div
          v-for="(key, index) in keys"
          :key="key.id"
          class="table-grid__cell"
        >
          <span v-if="index === 0 && currentCategory">
            {{ currentCategory.data[keys[0].id] }}
          </span>
          <span v-else>
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
        <TableGridRow
          v-for="node in data"
          ref="row"
          :key="node.key"
          :node="node"
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

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  @include darkScroll;
  position: relative;
}

.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  &.disabled {
    pointer-events: none;
  }

  &__row {
    &.sticky {
      position: sticky;
      top: 0;
      z-index: 2;
    }

    &--sticky {
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: #1c80cf;
    }

    &--key {
      background-color: $color-dark;
    }
  }

  &__row.sticky &__cell {
    background-color: transparent;
    color: $color-light;
    text-align: left;
  }

  &__row--sticky &__cell {
    background-color: transparent;
    color: $color-light;
    text-align: left;
  }

  &__row--key &__cell {
    &:first-child {
      text-align: left;
    }
  }

  &__cell {
    padding: 8px;
    background-color: $color-light;
    text-overflow: ellipsis;
    overflow: hidden;

    &--children {
      text-align: left;
    }
  }
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
    overflow-y: auto;
  }

  &__cell {
    padding: 8px;
  }
}
</style>
