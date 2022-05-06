<script>
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'
import InputSwitch from 'primevue/inputswitch'
import MultiSelect from 'primevue/multiselect'

import TreeTable from './Center/TreeTable.vue'
import TreeTableView from './Center/TreeTableView/TreeTableView.vue'
import ParameterList from './Center/ParameterList.vue'
import OutlayList from './Center/OutlayList.vue'
import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    Button,
    AutoComplete,
    InputSwitch,
    TreeTable,
    TreeTableView,
    ParameterList,
    MultiSelect,
    OutlayList,
  },
  data() {
    return {
      screenHeight: null,
      striped: false,
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
      items: [
        {
          label: 'Смета 1',
        },
        {
          label: 'Смета 2',
        },
        {
          label: 'Смета 3',
        },
      ],
    }
  },
  computed: {
    ...mapGetters('edition', ['active']),
    ...mapGetters('outlay', [
      'selectedRoom',
      'roots',
      'outlay',
      'currentRoomData',
      'roomsData',
      'keys',
      'rooms',
    ]),
    scrollHeight() {
      return `${this.screenHeight - 100}px`
    },
    jobs() {
      if (!this.selectedRoom) return []
      const jobs = this.currentRoomData.filter(n => n.children.length === 0)
      return jobs.map(n => ({
        name: n.data[this.keys[0].id],
        value: n,
      }))
    },
  },
  watch: {
    selectedRoom() {
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
    ...mapMutations('outlay', ['selectJob']),
    async windowResize() {
      if (!this.outlay) {
        return
      }
      await this.$nextTick()
      const { autocomplete } = this.$refs
      const { top } = autocomplete.$el.getBoundingClientRect()
      this.screenHeight = window.innerHeight - top
    },
    showInfo() {},
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()
      if (this.isObjectId(key)) {
        return childs
      }
      return [
        ...childs,
        {
          name: node.data[this.active.keys[0].id],
          value: node,
        },
      ]
    },
    searchJob(e) {
      this.filteredJobs = this.jobs.filter(jobs => {
        return jobs.name.toLowerCase().startsWith(e.query.toLowerCase())
      })
    },
    getParents(node) {
      const parentNode = this.roots.find(n =>
        n.children.find(c => c.key === node.key),
      )

      if (!parentNode) {
        return [node]
      }
      if (parentNode.level > 0) {
        return [node, ...this.getParents(parentNode)]
      }

      return [node, parentNode]
    },
    findJob(e) {
      const { table } = this.$refs
      const row = table.$el.querySelector(
        `.table-row[data-id="${e.value.value.key}"]`,
      )
      const ROW_HEIGHT = 32
      const offsetTop =
        ROW_HEIGHT + Object.keys(table.tree).length * ROW_HEIGHT || ROW_HEIGHT
      table.$el.scrollTo({
        top: row.offsetTop - offsetTop,
        behavior: 'smooth',
      })
      const parents = this.getParents(e.value.value)
      parents.forEach(this.selectJob)
    },
  },
}
</script>

<template>
  <div class="center">
    <div class="center__header">
      <Button
        icon="pi pi-question-circle"
        class="p-button-warning"
        @click="showInfo"
      />
      <OutlayList />
    </div>
    <ParameterList v-if="selectedRoom" />

    <div v-if="outlay" class="center__body">
      <div class="body-actions">
        <div class="search-wrapper">
          <i class="pi pi-search"></i>
          <AutoComplete
            v-model="selectedJob"
            ref="autocomplete"
            class="search"
            :scrollHeight="scrollHeight"
            :suggestions="filteredJobs"
            field="name"
            placeholder="Поиск"
            @complete="searchJob($event)"
            @item-select="findJob"
          />
        </div>
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
      <TreeTable v-if="selectedRoom" ref="table" :striped="striped" />
      <TreeTableView v-else-if="rooms.length > 0" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$header-height: 55px;

.center {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 0;
  min-height: 0px;

  &__header {
    display: flex;
    gap: 10px;
    align-items: center;
    border-bottom: 1px solid #ccc;
    padding: 0 20px;
    min-height: 55px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
    background-color: $color-light;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0px;
    background-color: $color-light;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
    border-radius: 5px;
  }
}

.body-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 20px;
}

.search-wrapper {
  max-width: 65%;
  width: 100%;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 10px;
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

<style lang="scss">
.p-tabview-panels {
  display: none;
}
</style>
