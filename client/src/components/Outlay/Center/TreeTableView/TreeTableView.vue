<script>
import { mapGetters } from 'vuex'

import TableRow from './TableRow.vue'
export default {
  components: { TableRow },
  data() {
    return {
      tree: {},
      currentRootIndex: 0,
    }
  },
  computed: {
    ...mapGetters('outlay', ['rooms', 'selectedValues', 'keys', 'roomsData']),
    data() {
      const roomsData = Object.entries(this.roomsData)
      if (roomsData.length === 0) return []
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
      if (!Object.keys(this.groupedList).length) {
        return null
      }
      return this.groupedList[0][this.currentRootIndex]
    },
    tableKeys() {
      if (!this.keys) return []

      return this.keys.map((k, index) => {
        if (index === 0 && this.currentRoot) {
          return {
            ...k,
            name: this.currentRoot.data[this.keys[0].id],
          }
        }
        return k
      })
    },
    groupedList() {
      if (!this.data) return []
      return this.data.reduce((acc, cur) => {
        acc[cur['level']] = [...(acc[cur['level']] || []), cur]
        return acc
      }, {})
    },
    treeView() {
      return Object.values(this.tree).map(n => n.data[this.keys[0].id])
    },
  },
  async mounted() {
    await this.$nextTick()
    const { row } = this.$refs
    if (!row) return
    const rows = row.filter(r => r.isParent)
    const domNodes = rows.map(r => r.$el)
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const { wrapper } = this.$refs
        if (!wrapper) return
        const { top, height } = wrapper.getBoundingClientRect()
        if (!Object.keys(this.groupedList).length) {
          return
        }
        if (e.boundingClientRect.top - top > height / 2) {
          return
        }

        const id = e.target.dataset?.id
        const level = +e.target.dataset?.level

        const newIndex = this.groupedList[level].findIndex(n => n.key === id)
        if (newIndex === -1) {
          return
        }
        if (e.isIntersecting) {
          if (level === 0) {
            if (newIndex > 0) {
              this.currentRootIndex = newIndex - 1
            }
            if (newIndex === 0) {
              this.tree = {}
              this.currentRootIndex = null
            }
            return
          }
          if (newIndex > 0) {
            this.tree[level] = this.groupedList[level][newIndex - 1]
          }
        } else {
          if (level === 0) {
            this.currentRootIndex = newIndex
            return
          }
          this.tree[level] = this.groupedList[level][newIndex]
        }
      })
    })

    domNodes.forEach(r => {
      observer.observe(r)
    })
  },
}
</script>

<template>
  <div class="table-wrapper" ref="wrapper">
    <table class="table">
      <col
        v-for="(key, index) in keys"
        :key="key.id"
        :width="index === 0 ? '50%' : ''"
      />

      <tr class="table__row table__row--key table__row--sticky">
        <th v-for="key in tableKeys" :key="key.id" class="table__cell">
          {{ key.name }}
        </th>
      </tr>
      <template v-if="treeView.length">
        <tr
          v-for="(node, index) in treeView"
          :key="node"
          :style="`top: ${32 * (index + 1)}px`"
          class="table__row table__row--sticky"
        >
          <td class="table__cell" :colspan="keys.length">
            {{ node }}
          </td>
        </tr>
      </template>
      <TableRow v-for="row in data" :key="row.key" ref="row" :node="row" />
    </table>
  </div>
</template>

<style lang="scss" scoped>
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
      background-color: var(--blue-600);
      z-index: 2;
    }

    &--sticky {
      position: sticky;
      top: 0;
      background-color: var(--blue-600);
      z-index: 2;
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

    &--children {
      text-align: left;
    }
  }
}
</style>
