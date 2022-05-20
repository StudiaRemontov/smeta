<script>
import AutoComplete from 'primevue/autocomplete'
import InputSwitch from 'primevue/inputswitch'
import MultiSelect from 'primevue/multiselect'

import TreeTable from './CenterSide/TreeTable/TreeTable.vue'
import TreeTableView from './CenterSide/TreeTableView/TreeTableView.vue'
import ParameterList from './CenterSide/ParameterList.vue'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AutoComplete,
    InputSwitch,
    TreeTable,
    TreeTableView,
    ParameterList,
    MultiSelect,
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
        const rooms = this.rooms.map(r => ({
          key: r.id,
          data: {
            [this.keys[0].id]: r.name,
          },
          children: this.roomsData[r.id],
        }))

        return rooms.map(r => {
          const values = r.children
            .map(r => this.treeToListOnlyValues(r, []))
            .flat()
          const filtered = values.filter(v =>
            this.selectedValues[r.key].includes(v.key),
          )
          const items = filtered.map(v => ({ ...v, room: r.key }))

          return {
            name: r.data[this.keys[0].id],
            items,
          }
        })
      }
      const parents = this.roots.filter(r => !r.parent)
      return parents.map(p => {
        return {
          name: p.data[this.keys[0].id],
          items: p.children.map(p => this.treeToListOnlyValues(p, [])).flat(),
        }
      })
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
      if (!this.outlay) {
        return
      }

      await this.$nextTick()
      const { autocomplete } = this.$refs
      const { top } = autocomplete.$el.getBoundingClientRect()
      this.screenHeight = window.innerHeight - top
    },
    showInfo() {
      this.$refs['info-modal'].show()
    },
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToListOnlyValues(node, parents = []) {
      const { children, key } = node
      if (this.isObjectId(key)) {
        parents.push(node.data[this.keys[0].id])
        return children.map(c => this.treeToListOnlyValues(c, parents)).flat()
      }
      const arrayName = [...parents, node.data[this.keys[0].id]]
      const name = arrayName.join('/')
      return [
        {
          key,
          name,
          value: node,
        },
      ]
    },
    searchJob(e) {
      const query = e.query
      const filteredJobs = []

      for (const category of this.jobs) {
        const filteredItems = category.items.filter(j =>
          j.name.toLowerCase().includes(query.toLowerCase()),
        )
        if (filteredItems && filteredItems.length) {
          filteredJobs.push({ ...category, items: filteredItems })
        }
      }

      this.filteredJobs = filteredJobs
    },
    findJob(e) {
      const key = e.value.value.key
      const room = e.value.room
      const { table } = this.$refs
      if (!this.selectedRoom) {
        return table.scrollTo(room, key)
      }
      table.scrollTo(key)
    },
    autoCompleteClickHanler() {
      this.selectedJob = null
    },
  },
}
</script>

<template>
  <div class="center">
    <ParameterList v-if="selectedRoom" />
    <div v-if="outlay" class="center__body">
      <div class="body-actions">
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
            @complete="searchJob($event)"
            @item-select="findJob"
            @click="autoCompleteClickHanler"
          />
        </div>
        <div class="body-actions__group">
          <MultiSelect
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
      <TreeTable v-if="selectedRoom" ref="table" :striped="striped" />
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
  min-width: 300px;
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
}

::v-deep(.multiselect) {
  max-width: 25%;
  min-width: 150px;
}

.switch-wrapper {
  width: 150px;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
