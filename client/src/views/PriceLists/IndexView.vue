<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import expandAllMixin from '@/mixins/expandAll.mixin'

import SortModal from '@/components/PriceLists/Modals/SortModal.vue'

import { mapGetters } from 'vuex'

export default {
  components: { TreeTable, Column, ContentBody, InputText, SortModal },
  mixins: [expandAllMixin],
  data() {
    return {
      nodeToSort: null,
      showModal: false,
    }
  },
  computed: {
    ...mapGetters('edition', ['selectedEdition']),
    columns() {
      return this.selectedEdition.keys.map((key, index) => ({
        ...key,
        id: key.id + '',
        expander: index === 0,
      }))
    },
    tree() {
      if (!this.selectedEdition) return []
      const { data } = this.selectedEdition
      return [data]
    },
  },
  mounted() {
    this.expandFirstChildren()
  },
  methods: {
    sortCategory(node) {
      this.nodeToSort = node
      this.showModal = true
    },
  },
}
</script>

<template>
  <ContentBody>
    <template #content>
      <SortModal v-model="showModal" :nodeToSort="nodeToSort" />
      <TreeTable
        v-if="tree"
        :value="tree"
        :expandedKeys="expandedKeys"
        :scrollable="true"
        class="p-treetable-sm"
        :filters="filters"
        scrollHeight="flex"
      >
        <template #header>
          <div class="text-right">
            <div class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="filters['global']"
                @input="filterHandler"
                placeholder="Глобальный поиск"
              />
            </div>
          </div>
        </template>
        <Column
          v-for="(col, index) in columns"
          :key="col.id"
          :field="col.id"
          :header="col.name"
          :expander="col.expander"
          :class="col.expander ? 'first' : 'secondary'"
        >
          <template #body="{ node }">
            <span
              class="column-body"
              :class="{ bold: node.children.length > 0 }"
            >
              <button
                v-if="
                  node.children.length &&
                  node.children.length > 0 &&
                  index === 0
                "
                class="button"
                @click="sortCategory(node)"
              >
                <i class="pi pi-sort-alt" />
              </button>

              {{ node.data[col.id] }}
            </span>
          </template>
        </Column>
      </TreeTable>
    </template>
  </ContentBody>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.bold {
  font-weight: 600;
}
</style>

<style lang="scss">
.p-treetable-tbody span {
  vertical-align: middle;
  display: block;
  width: 100%;
}
</style>
