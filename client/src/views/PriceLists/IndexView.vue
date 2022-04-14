<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import ConfirmModal from '@/components/PriceLists/Clone/ConfirmClone.vue'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: { TreeTable, Column, ContentBody, ConfirmModal },
  data() {
    return {
      expandedKeys: {},
    }
  },
  computed: {
    ...mapGetters('directory', ['roots']),
    ...mapGetters('edition', [
      'selectedEdition',
      'editions',
      'clonedDirectories',
    ]),
    ...mapGetters('priceList', ['selectedPriceList']),
    columns() {
      return this.selectedEdition.keys.map((key, index) => ({
        ...key,
        id: key.id + '',
        expander: index === 0,
      }))
    },
    root() {
      if (!this.selectedPriceList) return null
      const editionId = this.selectedPriceList.editions[0]
      const root = editionId && this.editions.find(e => e._id === editionId)
      const rootId = root?.dirId
      return this.roots.find(r => r._id === rootId)
    },
    tree() {
      if (!this.selectedEdition) return []
      const { data } = this.selectedEdition
      return [data]
    },
    isSame() {
      if (!this.selectedEdition) {
        return false
      }
      const isExists = !!this.clonedDirectories.find(
        d => d._id === this.selectedEdition.dirId,
      )
      const isSame = !![this.selectedEdition.data].find(this.isSameNode)

      return isExists && isSame
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
    ...mapMutations('edition', ['setClone']),
    ...mapActions('edition', ['remove']),
    getSubItems(directory) {
      const { values, subItems } = directory

      const subChildren =
        subItems.length === 0
          ? values.map(n => ({
              key: n.id,
              data: n.data,
              children: [],
            }))
          : subItems.map(c => this.getSubItems(c))
      const data = { [this.columns[0].id]: directory.name }

      return {
        key: directory.dirId,
        data,
        children: subChildren,
      }
    },
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
    isSameNode(node, directory) {
      const { children, key } = node
      const isDirectory = this.isObjectId(key)
      if (isDirectory) {
        const directory = this.clonedDirectories.find(d => d._id === node.key)
        if (!directory) {
          return false
        }
        return children.every(c => this.isSameNode(c, directory))
      }
      const { values } = directory
      return !!values.find(v => v.id === key)
    },
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    async clone() {
      if (!this.isSame) {
        const response = await this.$refs['confirm-modal'].show({
          title: 'Применить изменения',
          okButton: 'Да',
          cancelButton: 'Нет',
        })
        if (response) {
          return this.setClone({
            value: this.tree,
            mergeType: 'rightJoin',
          })
        }
      }
      this.setClone({
        value: this.tree,
        mergeType: 'full',
      })
    },
    async removeHandler() {
      try {
        await this.remove(this.selectedEdition._id)
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <ContentBody>
    <template #header>
      <div class="header">
        <AppButton outlined variant="primary" @click="clone"
          >Клонировать {{ isSame ? '' : '*' }}</AppButton
        >
        <AppButton outlined variant="danger" @click="removeHandler"
          >Удалить</AppButton
        >
      </div>
    </template>
    <template #content>
      <ConfirmModal ref="confirm-modal" />
      <TreeTable
        v-if="tree"
        :value="tree"
        :expandedKeys="expandedKeys"
        :scrollable="true"
        scrollHeight="flex"
      >
        <Column
          v-for="col in columns"
          :key="col.id"
          :field="col.id"
          :header="col.name"
          :expander="col.expander"
          :class="{ first: col.expander }"
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
