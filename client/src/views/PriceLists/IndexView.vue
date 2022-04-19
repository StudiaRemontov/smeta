<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

import { mapGetters } from 'vuex'

export default {
  components: { TreeTable, Column, ContentBody, InputText },
  data() {
    return {
      expandedKeys: {},
      filters: {},
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
  watch: {
    tree: {
      handler() {
        this.expandAll()
      },
      immediate: true,
    },
  },
  methods: {
    expandAll() {
      for (const node of this.tree) {
        this.expandNode(node)
      }

      this.expandedKeys = { ...this.expandedKeys }
    },
    expandNode(node) {
      if (node.children && node.children.length) {
        this.expandedKeys[node.key] = true

        for (const child of node.children) {
          this.expandNode(child)
        }
      }
    },
  },
}
</script>

<template>
  <ContentBody>
    <template #content>
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
                placeholder="Глобальный поиск"
              />
            </div>
          </div>
        </template>
        <Column
          v-for="col in columns"
          :key="col.id"
          :field="col.id"
          :header="col.name"
          :expander="col.expander"
          :class="col.expander ? 'first' : 'secondary'"
        >
          <template #body="{ node }">
            <span :class="{ bold: node.children.length > 0 }">
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
