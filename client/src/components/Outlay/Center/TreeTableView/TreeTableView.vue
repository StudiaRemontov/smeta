<script>
import { mapGetters } from 'vuex'

import TableGridRow from './TableGridRow.vue'
import tableRowColors from '@/mixins/tableRowColors.mixin'

export default {
  components: { TableGridRow },
  mixins: [tableRowColors],
  data() {
    return {
      currentRoom: null,
      currentCategory: null,
      currentSubCategory: null,
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
        const children = values.filter(c =>
          this.selectedValues[key].includes(c.key),
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
    subCategoriesList() {
      return []
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
    const { wrapper } = this.$refs
    if (!wrapper) return
    const rows = wrapper.querySelectorAll('.table-row.parent, .table-row.room')
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

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  @include darkScroll;
  position: relative;
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
    position: relative;
  }

  &__cell {
    @include table-cell;
  }
}
</style>
