<script>
import AutoComplete from 'primevue/autocomplete'
import InputSwitch from 'primevue/inputswitch'
import MultiSelect from 'primevue/multiselect'

import TreeTable from './CenterSide/TreeTable/TreeTable.vue'
import TreeTableView from './CenterSide/TreeTableView/TreeTableView.vue'
import ResultsTable from './CenterSide/Results/ResultsTable.vue'

import { isObjectId } from '@/helpers/isObjectId'

import { uniqBy } from 'lodash'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AutoComplete,
    InputSwitch,
    TreeTable,
    TreeTableView,
    MultiSelect,
    ResultsTable,
  },
  data() {
    return {
      screenHeight: null,
      selectedJob: null,
      filteredJobs: [],
      selectedFastJobs: [],
      fastJobs: [
        {
          label: 'Работы 1',
        },
        {
          label: 'Работы 2',
        },
        {
          label: 'Работы 3',
        },
      ],
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'selectedRoom',
      'roots',
      'outlay',
      'currentRoomData',
      'roomsData',
      'keys',
      'rooms',
      'selectedValues',
      'showResults',
    ]),
    striped: {
      get() {
        return this.$store.getters['outlay/striped']
      },
      set(value) {
        this.setStriped(value)
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
    ...mapMutations('outlay', ['selectJob', 'setStriped']),
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
  <div class="center">
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
          <MultiSelect
            v-if="selectedRoom"
            v-model="selectedFastJobs"
            class="multiselect"
            placeholder="Быстрые работы"
            :options="fastJobs"
            optionLabel="label"
          />
          <div class="switch-wrapper">
            <div class="switch">
              <InputSwitch v-model="striped" />
            </div>
            <span>Чередовние цветов</span>
          </div>
        </div>
      </div>
      <div v-if="showResults" class="results-wrapper">
        <ResultsTable />
      </div>
      <TreeTable v-else-if="selectedRoom" ref="table" :striped="striped" />
      <TreeTableView v-else-if="rooms.length > 0" ref="table" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.center {
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);

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

::v-deep(.multiselect) {
  min-width: 150px;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}

.results-wrapper {
  padding: 20px;
}
</style>
