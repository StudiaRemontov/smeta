<script>
import { mapGetters, mapMutations, mapState } from 'vuex'

import InfoBlock from './RightSide/InfoBlock.vue'
import ResultsForm from './RightSide/ResultsForm.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'
import CollapseBlock from './LeftSide/CollapseBlock.vue'

import {
  getValuesInside,
  treeToListOnlyKeys,
} from '@/store/modules/outlay.module'
import { filterTreeByQuantity } from '@/store/modules/acts.module'

import { isObjectId } from '@/helpers/isObjectId'

export default {
  components: {
    InfoBlock,
    ResultsForm,
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
    ...mapGetters('acts', [
      'actsData',
      'act',
      'acts',
      'activeRoom',
      'activeTab',
      'changeView',
    ]),
    showRightSide: {
      get() {
        return this.$store.getters['acts/showRightSide']
      },
      set(value) {
        return this.setShowRightSide(value)
      },
    },
    croppedActs() {
      const index = this.acts.findIndex(a => a._id === this.act._id)
      return [...this.acts].slice(0, index + 1)
    },
    completed() {
      return this.rooms.reduce((acc, r) => {
        const acts =
          this.activeTab === 'completed' ? [this.act] : this.croppedActs
        const values = acts
          .map(act => {
            const actRoomData = JSON.parse(
              JSON.stringify(this.actsData[act._id][r.id]),
            )
            const filtered = actRoomData.filter(filterTreeByQuantity)
            const keys = filtered.map(treeToListOnlyKeys).flat()
            return keys
          })
          .flat()
        const uniq = new Set(values)
        acc[r.id] = [...uniq]
        return acc
      }, {})
    },
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
      if (this.activeTab === 'completed') {
        const reversed = [...this.rooms]
        return reversed.map(room => {
          const values = JSON.parse(
            JSON.stringify(this.actsData[this.act._id][room.id]),
          )
          return this.getRoomWithSum(room, values)
        })
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
    roomsData() {
      const clone = JSON.parse(JSON.stringify(this.croppedActs))
      const data = clone.reduce((acc, act) => {
        this.rooms.forEach(room => {
          const roomData = JSON.parse(
            JSON.stringify(this.actsData[act._id][room.id]),
          )
          if (acc[room.id]) {
            acc[room.id] = [...acc[room.id], ...roomData]
            return
          }
          acc[room.id] = roomData
        })
        return acc
      }, {})
      return Object.entries(data).reduce((acc, [roomId, value]) => {
        const merged = this.mergeChildren(value)
        acc[roomId] = merged
        return acc
      }, {})
    },
  },
  methods: {
    ...mapMutations('acts', ['setShowRightSide']),
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
      const selected = this.croppedActs.map(_ => this.completed[room.id]).flat()
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
      return this.rooms.reduce((acc, room) => {
        const roomValues = this.roomsData[room.id].flat()
        const values = roomValues.reduce((acc, data) => {
          const nodes = getValuesInside(data)
          return [...acc, ...nodes]
        }, [])

        const groupped = values.reduce((acc, node) => {
          acc[node.key] = acc[node.key] || []
          acc[node.key].push(node)
          return acc
        }, {})

        const summed = Object.values(groupped).map(nodes => {
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
        })
        const cloneJobs = JSON.parse(JSON.stringify(this.roomsData[room.id]))
        const children = cloneJobs
          .map(n => this.updateNodesInTree(n, summed))
          .flat()

        acc[room.id] = children
        return acc
      }, {})
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
    <CollapseBlock v-model="showRightSide" :position="'right'" />
    <OutlayBlock class="wrapper__info">
      <InfoBlock />
    </OutlayBlock>
    <OutlayBlock class="wrapper__results">
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
  flex: 1;
  overflow: auto;

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;

    &-item {
      padding-bottom: 10px;
      border-bottom: 1px #ccc solid;
    }
  }

  &__results {
    min-height: 0px;
    display: flex;
    flex-direction: column;
    padding: 13px;
  }
}
</style>
