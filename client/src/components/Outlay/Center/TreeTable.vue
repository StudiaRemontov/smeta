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
      'activeData',
      'showOnlySelected',
      'nodeList',
      'room',
      'outlay',
      'roots',
    ]),
    keys() {
      if (!this.activeData) return []

      return this.activeData.keys.map((k, index) => {
        if (index === 0 && this.currentRoot) {
          return {
            ...k,
            name: this.currentRoot.data[this.activeData.keys[0].id],
          }
        }
        return k
      })
    },
    data() {
      if (!this.activeData) return []

      return this.activeData.data
    },
    // roots() {
    //   if (!this.editionData?.children) return []

    //   if (this.showOnlySelected) {
    //     if (this.editionData.children.length > 0) {
    //       const hasValues = !this.isObjectId(this.editionData.children[0].key)
    //       if (hasValues) {
    //         return this.editionData.children.filter(n => {
    //           return this.room.jobs.find(j => j.key === n.key)
    //         })
    //       }
    //     }
    //   }
    //   return this.editionData.children
    // },
    currentRoot() {
      if (!Object.keys(this.groupedList).length) {
        return null
      }
      return this.groupedList[0][this.currentRootIndex]
    },
    rows() {
      if (!this.outlay || !this.keys.length || !this.nodeList) return []
      if (!this.room && this.outlay.rooms.length) {
        return this.outlay.rooms
          .map(r => {
            const roomCategory = {
              data: {
                [this.keys[0].id]: r.name,
              },
              children: r.jobs,
              key: r.id,
              level: 0,
            }
            const jobs = this.nodeList.filter(n => r.jobs.includes(n.key))
            return [roomCategory, ...jobs]
          })
          .flat()
      }
      if (this.showOnlySelected) {
        return this.nodeList.filter(n => this.room.jobs.includes(n.key))
      }
      return this.nodeList
    },
    groupedList() {
      if (!this.roots) return []
      // if (!this.room && this.keys.length) {
      //   const rooms = this.outlay.rooms.map(r => ({
      //     data: {
      //       [this.keys[0].id]: r.name,
      //     },
      //     children: r.jobs,
      //     key: r.id,
      //     level: 0,
      //   }))
      //   const roots = this.roots.map(r => ({
      //     ...r,
      //     level: r.level + 1,
      //   }))
      //   return [...rooms, ...roots].reduce((acc, cur) => {
      //     acc[cur['level']] = [...(acc[cur['level']] || []), cur]
      //     return acc
      //   }, {})
      // }
      return this.roots.reduce((acc, cur) => {
        acc[cur['level']] = [...(acc[cur['level']] || []), cur]
        return acc
      }, {})
    },
    treeView() {
      return Object.values(this.tree).map(n => n.data[this.keys[0].id])
    },
    selectedValues() {
      if (this.room) {
        const room = this.outlay.rooms.find(r => r.id === this.room.id)
        return room.jobs.map(this.treeToList).flat()
      }

      return []
    },
  },
  watch: {
    async room() {
      // await this.$nextTick()
      // const { wrapper } = this.$refs
      // const parents = wrapper.querySelectorAll('.parent')
      // const observer = new IntersectionObserver(entries => {
      //   const { wrapper } = this.$refs
      //   const { top, height } = wrapper.getBoundingClientRect()
      //   entries.forEach(e => {
      //     if (!Object.keys(this.groupedList).length) {
      //       return
      //     }
      //     if (e.boundingClientRect.top - top > height / 2) {
      //       return
      //     }
      //     const id = e.target.dataset?.id
      //     const level = +e.target.dataset?.level
      //     const newIndex = this.groupedList[level].findIndex(n => n.key === id)
      //     if (newIndex === -1) {
      //       return
      //     }
      //     if (e.isIntersecting) {
      //       if (level === 0) {
      //         if (newIndex > 0) {
      //           this.currentRootIndex = newIndex - 1
      //         }
      //         return
      //       }
      //       if (newIndex > 0) {
      //         this.tree[level] = this.groupedList[level][newIndex - 1]
      //       }
      //     } else {
      //       if (level === 0) {
      //         this.currentRootIndex = newIndex
      //         return
      //       }
      //       this.tree[level] = this.groupedList[level][newIndex]
      //     }
      //   })
      // })
      // parents.forEach(r => {
      //   observer.observe(r)
      // })
      // this.tree = {}
    },
  },
  mounted() {
    // const selectedData = this.outlay.rooms.map(r => {
    //   return r.jobs.map(this.treeToList)
    // })
    // console.log(selectedData)
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
      <col width="60px" />

      <tr class="table__row table__row--key table__row--sticky">
        <th v-for="key in keys" :key="key.id" class="table__cell">
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
      <template v-if="rows">
        <TableRow
          v-for="(node, index) in rows"
          :key="room ? node.key + index : node.key"
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
