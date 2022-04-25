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
    }
  },
  computed: {
    ...mapGetters('priceList', ['priceLists']),
    ...mapGetters('edition', ['active']),
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
    children() {
      return this.data.children
    },
    currentRoot() {
      return this.children[this.currentRootIndex]
    },
  },
  async mounted() {
    this.setSelectedPriceList('6266a14ed9cb4f017de9e89b')
    await this.$nextTick()
    const { wrapper } = this.$refs
    const { top } = wrapper.getBoundingClientRect()
    const observer = new IntersectionObserver(entries => {
      entries.forEach(
        e => {
          if (top - e.boundingClientRect.top <= 0) {
            return
          }
          if (e.intersectionRatio === 0) {
            const index = e.target.dataset?.index
            this.currentRootIndex = +index
          } else {
            if (this.currentRootIndex > 0) {
              this.currentRootIndex--
            }
          }
        },
        { threshold: [1] },
      )
    })
    const roots = wrapper.querySelectorAll('.root')
    roots.forEach(r => {
      observer.observe(r)
    })
  },
  methods: {
    ...mapMutations('priceList', ['setSelectedPriceList']),
  },
}
</script>
<template>
  <div class="table-wrapper" ref="wrapper">
    <table class="table">
      <tr class="table__row table__row--sticky">
        <th v-for="key in keys" :key="key.id" class="table__cell">
          {{ key.name }}
        </th>
      </tr>
      <template v-if="children && children.length > 0">
        <TableGroup
          v-for="(item, index) in children"
          :key="item.key"
          :node="item"
          :index="0"
          :rootIndex="index"
          root
        />
      </template>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  @include darkScroll;
}

.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  &__row {
    &--sticky {
      position: sticky;
      top: 0;
      background-color: var(--blue-700);
    }
  }

  &__row--sticky &__cell {
    background-color: transparent;
    color: $color-light;
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
