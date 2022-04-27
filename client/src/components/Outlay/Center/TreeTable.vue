<script>
import { mapGetters, mapMutations } from 'vuex'

import TableGroup from './TableGroup.vue'

export default {
  components: {
    TableGroup,
  },
  data() {
    return {
      currentRootIndex: 0,
      tree: {},
    }
  },
  computed: {
    ...mapGetters('priceList', ['priceLists']),
    ...mapGetters('edition', ['active']),
    ...mapGetters('outlay', ['activeData']),
    keys() {
      if (!this.active) return []

      return this.active.keys.map((k, index) => {
        if (index === 0 && this.currentRoot) {
          return {
            ...k,
            name: this.currentRoot.data[this.active.keys[0].id],
          }
        }
        return k
      })
    },
    data() {
      if (!this.active) return []

      return this.active.data
    },
    roots() {
      return this.activeData?.children || []
    },
    currentRoot() {
      return this.roots[this.currentRootIndex]
    },
    nodeList() {
      return this.treeToList(this.data, 0, [])
    },
    groupedList() {
      return this.nodeList.reduce((acc, cur) => {
        if (cur.level < 2) {
          return acc
        }
        acc[cur['level']] = [...(acc[cur['level']] || []), cur]
        return acc
      }, {})
    },
    treeData() {
      return Object.values(this.tree).map(id =>
        this.nodeList.find(n => n.key === id),
      )
    },
  },
  async mounted() {
    this.setSelectedPriceList('6260fa68c14eb863c933e40a')
    const activeData = JSON.parse(JSON.stringify(this.active.data))
    this.setActiveData(activeData)
    await this.$nextTick()
    const { wrapper } = this.$refs

    const observer = new IntersectionObserver(
      entries => {
        const { wrapper } = this.$refs
        const { top } = wrapper.getBoundingClientRect()
        entries.forEach(e => {
          if (e.boundingClientRect.top - top > 100) {
            return
          }
          if (e.intersectionRatio === 0) {
            const level = +e.target.dataset?.level
            const index = +e.target.dataset?.index
            const id = e.target.dataset?.id

            if (level > 1) {
              if (this.tree[level + 1]) {
                delete this.tree[level + 1]
              }
              return (this.tree[level] = id)
            }
            this.currentRootIndex = +index
          } else {
            const level = +e.target.dataset?.level
            const id = e.target.dataset?.id

            if (level > 1) {
              const nextIndex = this.groupedList[level].findIndex(
                n => n.key === id,
              )
              if (nextIndex === 0) {
                // this.tree = {}
                return
              }
              this.tree[level] = this.groupedList[level][nextIndex - 1].key
              return
            }
            if (this.currentRootIndex > 0) {
              this.currentRootIndex--
            }
          }
        })
      },
      {
        root: wrapper,
        rootMargin: '-100px 0px',
      },
    )

    const roots = wrapper.querySelectorAll('.root')
    roots.forEach(r => {
      observer.observe(r)
    })
  },
  methods: {
    ...mapMutations('priceList', ['setSelectedPriceList']),
    ...mapMutations('outlay', ['setActiveData', 'setNodeList']),
    treeToList(node, level, list) {
      const { children } = node
      if (children && children.length > 0) {
        return [
          {
            ...node,
            level,
          },
          ...node.children.map(c => this.treeToList(c, level + 1, list)).flat(),
        ]
      }
      return [...list]
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
      <col width="50px" />

      <tr class="table__row table__row--key table__row--sticky">
        <th v-for="key in keys" :key="key.id" class="table__cell">
          {{ key.name }}
        </th>
        <th></th>
      </tr>
      <template v-if="treeData && treeData.length > 0">
        <tr
          v-for="(treeNode, index) in treeData"
          :key="treeNode.key"
          :style="`top: ${31 * (index + 1)}px; background-color: var(--blue-${
            700 - treeNode.level * 100
          })`"
          class="table__row table__row--sticky"
        >
          <th class="table__cell" :colspan="keys.length">
            {{ treeNode.data[keys[0].id] }}
          </th>
          <th></th>
        </tr>
      </template>
      <template v-if="roots && roots.length > 0">
        <TableGroup
          v-for="(item, index) in roots"
          :key="item.key"
          :node="item"
          :level="1"
          :index="index"
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
  }

  &__row--sticky &__cell {
    background-color: transparent;
    color: $color-light;
    text-align: left;
  }

  &__row--key &__cell {
    text-align: center;

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
