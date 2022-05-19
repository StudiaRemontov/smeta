<script>
import { mapGetters, mapState } from 'vuex'

import CategoryList from './RightSide/CategoryList.vue'
import ResultsForm from './RightSide/ResultsForm.vue'

export default {
  components: {
    CategoryList,
    ResultsForm,
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
    data() {
      if (this.selectedRoom) {
        const { id } = this.selectedRoom
        const values = JSON.parse(JSON.stringify(this.currentRoomData))
        return [this.getRoomWithSum(id, values)]
      }
      const roomsClone = JSON.parse(
        JSON.stringify(Object.entries(this.roomsData)),
      )
      return roomsClone.map(([roomId, values]) =>
        this.getRoomWithSum(roomId, values),
      )
    },
  },
  methods: {
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (this.isObjectId(key)) {
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
    getRoomWithSum(roomId, values) {
      const room = this.rooms.find(r => r.id === roomId)
      const selected = this.selectedValues[roomId]
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
    <div class="wrapper__category-list">
      <CategoryList :categories="data" />
    </div>
    <ResultsForm :data="data" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  background-color: $color-light;
  border-radius: 10px;
  padding: 0px 13px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);

  &__category-list {
    flex: 1;
    padding-top: 25px;
  }
}
</style>
