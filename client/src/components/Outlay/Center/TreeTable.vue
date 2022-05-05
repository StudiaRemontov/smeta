<script>
import { mapGetters, mapMutations } from 'vuex'
import TableRow from './TableRow.vue'

export default {
  components: {
    TableRow,
  },
  props: {
    striped: Boolean,
  },
  data() {
    return {
      currentRootIndex: 0,
      tree: {},
    }
  },
  computed: {
    ...mapGetters('priceList', ['priceLists']),
    ...mapGetters('edition', ['editions']),
    ...mapGetters('outlay', [
      'keys',
      'activeData',
      'showOnlyChecked',
      'nodeList',
      'selectedRoom',
      'outlay',
      'roots',
      'currentRoomData',
      'selectedValues',
    ]),
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
    data() {
      if (!this.activeData) return []

      return this.activeData.data
    },
    currentRoot() {
      if (!Object.keys(this.groupedList).length) {
        return null
      }
      return this.groupedList[0][this.currentRootIndex]
    },
    rows() {
      if (!this.outlay || !this.keys.length) return []

      if (this.showOnlyChecked) {
        return this.currentRoomData.filter(n =>
          this.selectedValues.includes(n.key),
        )
      }
      return this.currentRoomData
    },
    groupedList() {
      if (!this.roots) return []

      if (this.showOnlyChecked) {
        const roots = this.roots.filter(r =>
          this.selectedValues.includes(r.key),
        )
        return roots.reduce((acc, cur) => {
          acc[cur['level']] = [...(acc[cur['level']] || []), cur]
          return acc
        }, {})
      }
      return this.roots.reduce((acc, cur) => {
        acc[cur['level']] = [...(acc[cur['level']] || []), cur]
        return acc
      }, {})
    },
    treeView() {
      return Object.values(this.tree).map(n => n.data[this.keys[0].id])
    },
  },
  watch: {
    async selectedRoom() {
      this.initObserver()
    },
    async showOnlyChecked() {
      this.initObserver()
    },
  },
  async mounted() {
    this.initObserver()
  },
  methods: {
    ...mapMutations('priceList', ['setSelectedPriceList']),
    ...mapMutations('outlay', ['setActiveData', 'setNodeList', 'setRoots']),
    treeToList(node) {
      const { key, children } = node
      if (children && children.length > 0) {
        if (key) return [node.key, ...node.children.map(this.treeToList)].flat()
      }
      return [node.key]
    },
    async initObserver() {
      await this.$nextTick()
      const { wrapper } = this.$refs
      if (!wrapper) {
        return
      }
      const parents = wrapper.querySelectorAll('.parent')
      const observer = new IntersectionObserver(entries => {
        const { wrapper } = this.$refs
        if (!wrapper) {
          return
        }
        const { top, height } = wrapper.getBoundingClientRect()
        entries.forEach(e => {
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
      parents.forEach(r => {
        observer.observe(r)
      })
      this.tree = {}
    },
  },
}
</script>
<template>
  <div class="table-wrapper" ref="wrapper">
    <table class="table" :class="{ disabled: showOnlyChecked }">
      <col
        v-for="(key, index) in keys"
        :key="key.id"
        :width="index === 0 ? '50%' : ''"
      />
      <col width="60px" />

      <tr class="table__row table__row--key table__row--sticky">
        <th v-for="key in tableKeys" :key="key.id" class="table__cell">
          {{ key.name }}
        </th>
        <th></th>
      </tr>
      <template v-if="treeView.length">
        <tr
          v-for="(node, index) in treeView"
          :key="node"
          :style="`top: ${32 * (index + 1)}px`"
          class="table__row table__row--sticky"
        >
          <td class="table__cell" :colspan="keys.length + 1">
            {{ node }}
          </td>
        </tr>
      </template>
      <template v-if="rows && rows.length > 0">
        <TableRow
          v-for="(node, index) in rows"
          :key="selectedRoom ? node.key + index : node.key"
          :node="node"
          :rowIndex="index"
          :selected="selectedValues.includes(node.key)"
        />
      </template>
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
