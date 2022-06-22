<script>
import { mapGetters, mapState } from 'vuex'

import CategoryList from './RightSide/CategoryList.vue'
import ResultsForm from './RightSide/ResultsForm.vue'
import ParameterList from './RightSide/ParameterList.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

import {
  getValuesInside,
  treeToListOnlyKeys,
} from '@/store/modules/outlay.module'
import { filterTreeByQuantity } from '@/store/modules/acts.module'

import { isObjectId } from '@/helpers/isObjectId'

export default {
  components: {
    CategoryList,
    ResultsForm,
    ParameterList,
    OutlayBlock,
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
    ...mapGetters('acts', [
      'actsData',
      'act',
      'activeRoom',
      'completedValues',
      'changeView',
    ]),
    data() {
      if (this.rooms.length === 0) {
        return []
      }
      if (this.activeRoom) {
        const values = JSON.parse(
          JSON.stringify(this.actsData[this.act._id][this.activeRoom.id]),
        )

        const room = JSON.parse(JSON.stringify(this.activeRoom))
        return [this.getRoomWithSum(room, values)]
      }
      const roomsClone = this.getDataWithRoom()
      if (this.changeView) {
        const room = JSON.parse(JSON.stringify(this.rooms[0]))
        const values = this.getDataWithCategories(roomsClone)
        return [this.getRoomWithSum2(room, values)]
      }
      const reversed = [...this.rooms]
      return reversed.map(room => {
        const values = roomsClone[room.id]
        return this.getRoomWithSum(room, values)
      })
    },
  },
  methods: {
    mergeChildren(nodes) {
      const groupped = nodes.reduce((acc, node) => {
        acc[node.key] = acc[node.key] || []
        const { children } = node
        const data = children.length > 0 ? children : node
        acc[node.key].push(data)
        return acc
      }, {})
      if (nodes && nodes.length > 0 && nodes[0].children.length === 0) {
        const summed = Object.values(groupped).map(this.sumQuantities)
        return summed
      }
      return Object.entries(groupped).map(([key, values]) => {
        const node = nodes.find(n => n.key === key)
        const { children } = node
        if (children && children.length > 0) {
          const flatted = values.flat()
          node.children = this.mergeChildren(flatted)
          return node
        }
        return node
      })
    },
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
          const sumData = val.data.quantity * val.data[this.priceKey.id]
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
      const selected = this.completedValues[this.act._id][room.id]
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
    getRoomWithSum2(room, values) {
      const selected = values.map(treeToListOnlyKeys).flat()
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
    sumQuantities(nodes) {
      const node = nodes.reduce((acc, node) => {
        if (!Object.keys(acc).length) {
          return node
        }
        const { data: accData } = acc
        const { data: nodeData } = node
        const quantity = accData.quantity + nodeData.quantity
        const newData = {
          ...accData,
          quantity,
        }
        return {
          ...acc,
          data: newData,
        }
      }, {})
      return node
    },
    updateNodesInTree(node, newNodes) {
      const { key, children } = node
      const isInNewNode = newNodes.find(n => n.key === key)
      if (isInNewNode) {
        return isInNewNode
      }
      if (children && children.length > 0) {
        node.children = children.map(n => this.updateNodesInTree(n, newNodes))
      }
      return node
    },
    getDataWithRoom() {
      const roomsData = Object.values(this.actsData)
      return roomsData.reduce((acc, room) => {
        const roomValues = roomsData.map(r => r[room.id]).flat()

        const values = roomValues.reduce((acc, data) => {
          const nodes = getValuesInside(data)
          return [...acc, ...nodes]
        }, [])

        const groupped = values.reduce((acc, node) => {
          acc[node.key] = acc[node.key] || []
          acc[node.key].push(node)
          return acc
        }, {})
        const summed = Object.values(groupped).map(this.sumQuantities)
        const cloneJobs = JSON.parse(JSON.stringify(room.jobs))
        const children = cloneJobs
          .map(n => this.updateNodesInTree(n, summed))
          .flat()
        const filtered = children.filter(filterTreeByQuantity)

        acc[room.id] = filtered
        return acc
      })
    },
    getDataWithCategories(dataWithRooms) {
      const data = JSON.parse(JSON.stringify(dataWithRooms))
      const categories = Object.values(data).flat()
      const categoriesData = this.mergeChildren(categories)
      return categoriesData
    },
  },
}
</script>

<template>
  <div class="wrapper">
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
  gap: 15px;

  &__results {
    flex: 1;
    min-height: 0px;
    display: flex;
    flex-direction: column;
    padding: 13px;
  }
}
</style>
