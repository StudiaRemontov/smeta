<script>
import { mapGetters, mapMutations, mapState } from 'vuex'

import CategoryList from './RightSide/CategoryList.vue'
import ResultsForm from './RightSide/ResultsForm.vue'
import ParameterList from './RightSide/ParameterList.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'
import CollapseBlock from '../../Act/BodyRow/LeftSide/CollapseBlock.vue'

import { isObjectId } from '@/helpers/isObjectId'

export default {
  components: {
    CategoryList,
    ResultsForm,
    ParameterList,
    OutlayBlock,
    CollapseBlock,
  },
  computed: {
    ...mapState('outlay', ['selectedValues']),
    ...mapGetters('outlay', [
      'outlay',
      'rooms',
      'roomsData',
      'quantityKey',
      'priceKey',
      'keys',
      'selectedRoom',
      'currentRoomData',
    ]),
    showRightSide: {
      get() {
        return this.$store.getters['outlay/showRightSide']
      },
      set(value) {
        return this.setShowRightSide(value)
      },
    },
    data() {
      if (this.selectedRoom) {
        const values = JSON.parse(JSON.stringify(this.currentRoomData))
        const room = JSON.parse(JSON.stringify(this.selectedRoom))
        return [this.getRoomWithSum(room, values)]
      }
      const roomsClone = JSON.parse(JSON.stringify(this.roomsData))
      const reversed = [...this.rooms]
      return reversed.map(room => {
        const values = roomsClone[room.id]
        return this.getRoomWithSum(room, values)
      })
    },
  },
  methods: {
    ...mapMutations('outlay', ['setShowRightSide']),
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (isObjectId(key)) {
        return childs
      }

      return [node]
    },
    getSelectedItems(subcategories, selected) {
      return subcategories.filter(value => selected.includes(value.key))
    },
    getSubCategoriesWithSum(subCategories, selected) {
      return subCategories.map(c => {
        const allNodes = this.treeToListOnlyValues(c)
        const selectedNodes = this.getSelectedItems(allNodes, selected)
        const sum = selectedNodes.reduce((acc, val) => {
          const sumData =
            val.data[this.quantityKey.id] * val.data[this.priceKey.id]
          return acc + sumData
        }, 0)

        return {
          id: c.key,
          name: c.data[this.keys[0].id],
          sum,
        }
      })
    },
    getSum(values) {
      return values.reduce((acc, val) => (acc += +val.sum), 0)
    },
    getRoomWithSum(room, values) {
      const selected = this.selectedValues[room.id]
      const nodes = this.getSelectedItems(values, selected)
      const vals = nodes.map(category => {
        const subCategories = this.getSelectedItems(category.children, selected)
        const subCategoryValues = this.getSubCategoriesWithSum(
          subCategories,
          selected,
        )
        const sum = this.getSum(subCategoryValues)
        return {
          id: category.key,
          name: category.data[this.keys[0].id],
          sum,
          jobs: subCategoryValues,
        }
      })
      const sumOfRoom = this.getSum(vals)
      return {
        id: room.id,
        name: room.name,
        jobs: vals,
        sum: sumOfRoom,
      }
    },
  },
}
</script>

<template>
  <div class="wrapper">
    <CollapseBlock v-model="showRightSide" :position="'right'" />
    <ParameterList class="wrapper__parameters" />
    <OutlayBlock class="wrapper__results">
      <CategoryList :categories="data" />
      <ResultsForm :data="data" />
    </OutlayBlock>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__results {
    flex: 1;
    min-height: 0px;
    display: flex;
    flex-direction: column;
    padding: 13px;
  }
}
</style>
