<script>
import AutoComplete from 'primevue/autocomplete'
import InputSwitch from 'primevue/inputswitch'

import RoomTable from './CenterSide/RoomTable/RoomTable.vue'
import CompletedTable from './CenterSide/CompletedTable/CompletedTable.vue'
import ActsTable from './CenterSide/ActsTable/ActsTable.vue'
import OutlayTable from './CenterSide/OutlayTable/OutlayTable.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

import { isObjectId } from '@/helpers/isObjectId'

import { uniqBy } from 'lodash'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AutoComplete,
    InputSwitch,
    RoomTable,
    OutlayBlock,
    CompletedTable,
    ActsTable,
    OutlayTable,
  },
  data() {
    return {
      screenHeight: null,
      selectedJob: null,
      filteredJobs: [],
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'selectedRoom',
      'roots',
      'outlay',
      'roomsData',
      'keys',
      'rooms',
      'selectedValues',
      'showResults',
    ]),
    ...mapGetters('acts', ['activeTab', 'activeRoom', 'act']),
    striped: {
      get() {
        return this.$store.getters['outlay/striped']
      },
      set(value) {
        this.setStriped(value)
      },
    },
    changeView: {
      get() {
        return this.$store.getters['acts/changeView']
      },
      set(value) {
        this.setChangeView(value)
      },
    },
    scrollHeight() {
      return `${this.screenHeight - 100}px`
    },
    jobs() {
      if (!this.selectedRoom) {
        const reversed = [...this.rooms].reverse()
        const rooms = reversed.map(r => ({
          key: r.id,
          data: {
            [this.keys[0].id]: r.name,
          },
          name: r.name,
          children: this.roomsData[r.id],
        }))
        return rooms.map(r => this.getGroupsWithRoom(r, null, r.key)).flat()
      }
      return this.roots.map(r => this.getGroups(r, null)).flat()
    },
  },
  watch: {
    selectedRoom() {
      this.windowResize()
    },
    outlay() {
      this.windowResize()
    },
  },
  mounted() {
    this.windowResize()
    window.addEventListener('resize', this.windowResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.windowResize)
  },
  methods: {
    ...mapMutations('outlay', ['setStriped']),
    ...mapMutations('acts', ['setChangeView']),
    async windowResize() {
      if (!this.outlay || this.showResults) {
        return
      }
      await this.$nextTick()
      const { autocomplete } = this.$refs
      const { top } = autocomplete.$el.getBoundingClientRect()
      this.screenHeight = window.innerHeight - top
    },
    getGroupsWithRoom(node, parent = null, roomId) {
      const { children, key, data } = node
      if (children && children.length > 0) {
        node.parent = parent
        const returnData = {
          ...node,
          name: data[this.keys[0].id],
          items: [],
          roomId,
        }

        const childrenGroups = node.children
          .map(c => this.getGroupsWithRoom(c, key, roomId))
          .flat()
        const selectedGroups = childrenGroups.filter(g =>
          this.selectedValues[roomId].includes(g.key),
        )
        if (isObjectId(children[0].key)) {
          return [
            {
              ...returnData,
            },
            ...selectedGroups,
          ]
        }
        const selectedItems = node.children.filter(n =>
          this.selectedValues[roomId].includes(n.key),
        )
        return [
          {
            ...returnData,
            items: selectedItems.map(c => ({
              ...c,
              name: c.data[this.keys[0].id],
              roomId,
            })),
          },
          ...selectedGroups,
        ]
      }
      return []
    },
    getGroups(node, parent) {
      const { children, key, data } = node
      if (children && children.length > 0) {
        node.parent = parent
        const returnData = {
          ...node,
          name: data[this.keys[0].id],
          items: [],
        }

        const childrenGroups = node.children
          .map(c => this.getGroups(c, key))
          .flat()

        if (isObjectId(children[0].key)) {
          return [
            {
              ...returnData,
            },
            ...childrenGroups,
          ]
        }
        return [
          {
            ...returnData,
            items: node.children.map(c => ({
              ...c,
              name: c.data[this.keys[0].id],
            })),
          },
          ...childrenGroups,
        ]
      }
      return []
    },
    getParentsOfNode(parentId) {
      const parent = this.jobs.find(j => j.key === parentId)
      if (!parent) {
        return []
      }
      if (parent.parent) {
        const parentOfParent = this.getParentsOfNode(parent.parent)
        return [parentOfParent, parent]
      }
      return [parent]
    },
    getParentsOfRoom(roomId, parentId) {
      const parent = this.jobs.find(
        j => j.key === parentId && j.roomId === roomId,
      )
      if (parent.parent) {
        const parentOfParent = this.getParentsOfRoom(roomId, parent.parent)
        return [parentOfParent, parent]
      }
      return [parent]
    },
    async searchJob(e) {
      const query = e.query
      const filteredJobs = []
      for (const category of this.jobs) {
        const filteredItems = category.items.filter(j =>
          j.name.toLowerCase().includes(query.toLowerCase()),
        )
        if (filteredItems && filteredItems.length) {
          const parents = this.selectedRoom
            ? this.getParentsOfNode(category.parent)
            : this.getParentsOfRoom(category.roomId, category.parent).flat()
          parents.forEach(p => {
            filteredJobs.push(p)
          })

          filteredJobs.push({ ...category, items: filteredItems })
        }
      }
      if (this.selectedRoom) {
        return (this.filteredJobs = uniqBy(filteredJobs, 'key'))
      }

      const groupedByRoom = filteredJobs.reduce((acc, item) => {
        acc[item.roomId] = acc[item.roomId] || []
        acc[item.roomId].push(item)
        return acc
      }, {})

      this.filteredJobs = Object.values(groupedByRoom).reduce((acc, item) => {
        const uniqueJobs = uniqBy(item, 'key')
        return [...acc, ...uniqueJobs]
      }, [])
    },
    async findJob(e) {
      const key = e.value.key
      const room = e.value.roomId
      const { table, autocomplete } = this.$refs
      const input = autocomplete.$el.querySelector('input')
      if (input) {
        await this.$nextTick()
        input.blur()
      }
      if (!this.selectedRoom) {
        return table.scrollTo(room, key)
      }
      table.scrollToAndSelect(e.value)
    },
    autoCompleteClickHanler() {
      this.selectedJob = null
    },
    autocompleteInput() {
      this.$refs.autocomplete.hideOverlay()
    },
  },
}
</script>

<template>
  <OutlayBlock class="center">
    <div v-if="outlay" class="center__body">
      <div v-if="!showResults" class="body-actions">
        <div class="search-wrapper">
          <i class="pi pi-search"></i>
          <AutoComplete
            v-model="selectedJob"
            ref="autocomplete"
            class="search"
            field="name"
            optionGroupLabel="name"
            optionGroupChildren="items"
            :scrollHeight="scrollHeight"
            :suggestions="filteredJobs"
            placeholder="Поиск"
            :delay="300"
            @input="autocompleteInput"
            @complete="searchJob($event)"
            @item-select="findJob"
            @click="autoCompleteClickHanler"
          />
        </div>
        <div class="body-actions__group">
          <div class="switch-wrapper">
            <div class="switch">
              <InputSwitch v-model="striped" />
            </div>
            <span>Чередовние цветов</span>
          </div>
          <div v-if="activeTab === 'results'" class="switch-wrapper">
            <div class="switch">
              <InputSwitch v-model="changeView" />
            </div>
            <span>Изменить вид</span>
          </div>
        </div>
      </div>
      <template v-if="activeTab === 'completed'">
        <CompletedTable ref="completed" />
      </template>
      <template v-else-if="activeTab === 'acts'">
        <ActsTable ref="acts" />
      </template>
      <template v-else-if="activeTab === 'results'">
        <OutlayTable ref="outlay" />
      </template>
      <template v-else-if="activeTab === 'room' && activeRoom">
        <RoomTable :room="activeRoom" :acts="[act]" ref="table" />
      </template>
    </div>
  </OutlayBlock>
</template>

<style lang="scss" scoped>
.center {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  overflow: hidden;

  &__body {
    display: flex;
    flex-direction: column;
    min-height: 0px;
  }
}

.body-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 20px;
  flex-wrap: wrap;

  &__group {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.search-wrapper {
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
}

::v-deep(.p-autocomplete) {
  width: 100%;

  .p-autocomplete-input {
    width: 100%;
  }

  -webkit-font-smoothing: subpixel-antialiased;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
