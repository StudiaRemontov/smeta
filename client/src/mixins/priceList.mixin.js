import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      selectedValues: null,
      selectedColumns: [],
      readOnlyColumns: [],
      name: '',
      rootId: null,
    }
  },
  computed: {
    ...mapGetters('directory', ['roots']),
    ...mapGetters('edition', [
      'clonedDirectories',
      'editions',
      'clone',
      'selectedEdition',
    ]),
    ...mapGetters('priceList', ['selectedPriceList']),
    selectedRoot() {
      if (!this.rootId && !this.selectedPriceList) return null
      const editionId =
        this.selectedPriceList && this.selectedPriceList.editions[0]

      const root = editionId && this.editions.find(e => e._id === editionId)
      const rootId = root ? root.dirId : this.rootId
      return this.roots.find(r => r._id === rootId)
    },
    columns() {
      if (!this.selectedRoot) return []
      return this.selectedRoot.keys.map((key, index) => ({
        ...key,
        id: key.id + '',
        expander: index === 0,
        editable: index === 2,
      }))
    },
  },
  methods: {
    ...mapMutations('edition', ['setClonedDirectories', 'setClone']),
    ...mapActions('edition', ['create']),
    getSubItems(directory) {
      const children = this.clonedDirectories.filter(
        d => d?.parent === directory._id,
      )
      const { values } = directory
      const subChildren = values
        ? values.map(n => ({
            key: n.id,
            data: n.data,
            children: [],
          }))
        : children.map(c => this.getSubItems(c))
      const data = { [this.columns[0].id]: directory.name }
      return {
        key: directory._id,
        data,
        children: subChildren,
      }
    },
    convertData(node) {
      const { children } = node
      if (children && children.length > 0) {
        node.children = children.filter(c => this.selectedValues[c.key])
        node.children = node.children.map(this.convertData)
      }
      return node
    },
    multiSelectChangeHandler() {
      this.readOnlyColumns = this.selectedColumns.map(c => {
        return this.columns.find(col => col.id === c.id)
      })
    },
    async createHandler() {
      if (!this.selectedRoot || !this.selectedValues || !this.name) {
        return
      }
      if (
        this.selectedColumns.length === 0 ||
        Object.keys(this.selectedValues).length === 0
      ) {
        return
      }
      if (!this.selectedPriceList) {
        const response = await this.$refs['create-priceList'].show({
          title: 'Создать прайс лист',
          okButton: 'Создать',
          cancelButton: 'Отмена',
        })

        if (!response) {
          return
        }
      }
      const keys = this.selectedColumns.map(k => {
        const readonly = !!this.readOnlyColumns.find(c => c.id === k.id)

        return {
          id: k.id,
          name: k.name,
          readonly,
        }
      })
      const data = this.convertData(JSON.parse(JSON.stringify(this.tree[0])))
      const edition = {
        keys,
        data,
        dirId: this.selectedRoot._id,
        name: this.name,
      }

      try {
        await this.create(edition)
        this.setClone(null)
        this.$router.push('/pricelists')
      } catch (error) {
        const { response } = error
        const message = response ? response.data.message : error.message
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        })
      }
    },
  },
}
