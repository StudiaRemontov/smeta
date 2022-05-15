<script>
import { mapGetters } from 'vuex'
import TableRow from '../TreeTable/TableRow.vue'
import rowColors from '@/mixins/tableRowColors.mixin'

export default {
  components: {
    TableRow,
  },
  mixins: [rowColors],
  data() {
    return {
      category: null,
      subCategory: null,
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
    ]),
    tableKeys() {
      if (!this.keys) return []

      return this.keys.map((k, index) => {
        // if (index === 0 && this.currentRoot) {
        //   return {
        //     ...k,
        //     name: this.currentRoot.data[this.keys[0].id],
        //   }
        // }
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
    categories() {
      return this.tableData
    },
    subCategories() {
      return this.tableData.map(this.getSubCategories).flat()
    },
  },
  watch: {
    selectedRoom() {
      this.initObserver()
    },
    showOnlyChecked() {
      this.initObserver()
    },
  },
  async mounted() {
    this.initObserver()
  },
  methods: {
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
          if (e.boundingClientRect.top - top > height / 2) {
            return
          }
          const id = e.target.dataset?.id
          const level = +e.target.dataset?.level
          const newIndex = level
            ? this.subCategories.findIndex(n => n.key === id)
            : this.categories.findIndex(n => n.key === id)

          if (e.isIntersecting) {
            // if (level === 0) {
            //   if (newIndex > 0) {
            //     const category = this.categories[newIndex - 1]
            //     console.log(category)
            //     this.category = category
            //     return
            //   }
            //   this.category = null
            // }
            // return
          }
          // if (level === 0) {
          // }
          // console.log(newIndex)
        })
      })
      parents.forEach(r => {
        observer.observe(r)
      })
    },
  },
}
</script>
<template>
  <div class="table-wrapper" ref="wrapper">
    <table class="table">
      <tr class="table__row table__row--key table__row--sticky">
        <th
          v-for="key in tableKeys"
          :key="key.id"
          class="table__cell"
          :class="{ price: key.id === priceKey.id }"
          :title="key.name"
        >
          {{ key.name }}
        </th>
        <th class="table__cell" title="Сумма">Сумма</th>
        <th></th>
      </tr>
      <!-- <template v-if="treeView.length">
        <tr
          v-for="(node, index) in treeView"
          :key="node"
          :style="`top: ${32 * (index + 1)}px;background-color: ${
            colors[index + 1]
          }`"
          class="table__row table__row--sticky"
        >
          <td class="table__cell" :colspan="keys.length + 1">
            {{ node }}
          </td>
          <td class="table__cell"></td>
        </tr>
      </template> -->
      <template v-if="tableData && tableData.length > 0">
        <TableRow
          v-for="(node, index) in tableData"
          :key="node.key"
          :node="node"
          :level="0"
          :index="index"
        />
      </template>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  flex: 1;
  overflow: auto;
  @include darkScroll;
  position: relative;
  margin-bottom: 10px;
}

.table {
  border-collapse: collapse;
  width: 100%;

  &__row {
    &--sticky {
      position: sticky;
      top: 0;
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
    text-overflow: ellipsis;
    overflow: hidden;

    &:first-of-type {
      max-width: 400px;
      min-width: 300px;
    }

    &.price {
      min-width: 100px;
    }
  }
}
</style>
