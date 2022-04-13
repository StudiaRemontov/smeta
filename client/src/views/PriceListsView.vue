<script>
import AppContent from '@/components/Layout/AppContent.vue'
import IndexView from './PriceLists/IndexView.vue'
import CloneView from './PriceLists/CloneView.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import keyTypes from '@/mixins/keyTypes.mixin'
import rootGetters from '@/mixins/rootGetters.mixin'

import Dropdown from 'primevue/dropdown'

export default {
  components: {
    AppContent,
    IndexView,
    CloneView,
    Dropdown,
  },
  mixins: [rootGetters, keyTypes],
  data() {
    return {
      priceListName: '',
      loading: true,
    }
  },
  computed: {
    ...mapGetters('directory', ['roots', 'directories']),
    ...mapGetters('priceList', ['priceLists', 'selectedPriceList']),
    ...mapGetters('edition', ['editions', 'selectedEdition', 'clone']),
    selectedPriceListId: {
      get() {
        return this.$store.state.priceList.selectedPriceList
      },
      set(value) {
        this.setSelectedPriceList(value)
      },
    },
    selectedEditionId: {
      get() {
        return this.$store.state.edition.selectedEdition
      },
      set(value) {
        this.setSelectedEdition(value)
        this.goToIndex()
      },
    },
    priceListOptions() {
      return this.priceLists.map(item => ({
        label: item.name,
        value: item._id,
      }))
    },
    editionOptions() {
      if (!this.selectedPriceList) {
        return []
      }

      const editions = this.editions.filter(edition => {
        return this.selectedPriceList.editions.includes(edition._id)
      })

      return editions.map(edition => ({
        label: `${edition.name} ${new Date(edition.date).toLocaleDateString()}`,
        value: edition._id,
      }))
    },
  },
  async mounted() {
    await Promise.all([this.fetchPriceLists(), this.fetchEditions()])
    this.createClonedDirectories()
    this.setData()
    this.loading = false
  },
  methods: {
    ...mapMutations('edition', ['setSelectedEdition', 'setClonedDirectories']),
    ...mapMutations('priceList', ['setSelectedPriceList']),
    ...mapActions('priceList', {
      fetchPriceLists: 'fetchAll',
      create: 'create',
    }),
    ...mapActions('edition', {
      fetchEditions: 'fetchAll',
    }),
    setInput(val) {
      this.priceListName = val
    },
    goToCreateEdition() {
      this.setSelectedEdition(null)
      this.$router.push('/pricelists/create')
      this.$refs['dropdown-edition'].hide()
    },
    goToCreatePriceList() {
      this.setSelectedPriceList(null)
      this.setSelectedEdition(null)
      this.$router.push('/pricelists/create')
      this.$refs['dropdown-priceList'].hide()
    },
    goToIndex() {
      this.$router.push('/pricelists')
      this.$refs['dropdown-edition'].hide()
    },
    priceListChangeHandler() {
      this.setData()
    },
    setData() {
      if (!this.selectedPriceList) {
        const priceList = this.priceLists[this.priceLists.length - 1]
        if (!priceList) {
          this.loading = false
          return
        }
        this.setSelectedPriceList(priceList._id)
      }
      if (this.$route.name === 'createEdition') {
        return
      }
      this.setSelectedEdition(
        this.selectedPriceList.editions[
          this.selectedPriceList.editions.length - 1
        ],
      )
    },
    getValueOfCell(dirId, rowId, keys) {
      const directory = this.roots.find(d => d._id === dirId)

      if (!directory) return null
      const visibleKeys = directory.keys.filter(k => keys.includes(k.id))

      return visibleKeys.map(key => {
        const row = directory.values.find(r => r.id === +rowId)
        if (key.type === this.InputType.SELECT) {
          const findingRow = row.data[key.id]
          return this.getValueOfCell(key.dirId, findingRow, key.keys)
        }

        return row.data[key.id]
      })
    },
    isValidClone(clone, clones) {
      if (!clone) {
        return false
      }
      const children = clones.find(d => d.parent === clone._id)
      const isValidChildren = this.isValidClone(children, clones)
      return isValidChildren || clone.values
    },
    createClonedDirectories() {
      const clone = JSON.parse(JSON.stringify(this.directories))
      const filtered = clone.filter(c => this.isValidClone(c, clone))
      const clonedDirectories = filtered.map(dir => {
        const { values } = dir
        if (!values) {
          return dir
        }
        const root = this.getRoot(dir._id)
        const { keys } = root
        const keysTypeSelect = keys.filter(
          k => k.type === this.InputType.SELECT,
        )
        dir.values = values.map(row => {
          row.data = Object.entries(row.data).reduce((acc, [key, value]) => {
            const selectKey = keysTypeSelect.find(k => k.id === +key)

            if (selectKey) {
              const findingRow = value
              const text = this.getValueOfCell(
                selectKey.dirId,
                findingRow,
                selectKey.keys,
              )
              acc[key] = text.join(', ')
              return acc
            }
            acc[key] = value
            return acc
          }, {})
          return row
        })

        return dir
      })
      this.setClonedDirectories(clonedDirectories)
    },
    async createPriceList() {
      const data = {
        name: this.priceListName,
      }
      try {
        const response = await this.create(data)
        this.priceListName = ''
        this.$refs['select-priceList'].select(response.data._id)
        this.$refs['select-priceList'].close()
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <AppContent v-if="!loading">
    <template #header>
      <div class="header">
        <div class="header__action">
          <label class="bold">Прайс лист</label>
          <Dropdown
            v-model="selectedPriceListId"
            ref="dropdown-priceList"
            @change="priceListChangeHandler"
            :options="priceListOptions"
            :filter="true"
            optionLabel="label"
            optionValue="value"
            placeholder="Выберите прайс лист"
          >
            <template #header>
              <AppButton
                class="dropdown-button"
                outlined
                @click="goToCreatePriceList"
              >
                Создать
              </AppButton>
            </template>
          </Dropdown>
        </div>
        <div class="header__action">
          <label class="bold">Редакция</label>
          <Dropdown
            v-model="selectedEditionId"
            ref="dropdown-edition"
            :options="editionOptions"
            :filter="true"
            optionLabel="label"
            optionValue="value"
            placeholder="Выберите редакцию"
          >
            <template #header>
              <AppButton
                class="dropdown-button"
                outlined
                @click="goToCreateEdition"
              >
                Создать
              </AppButton>
            </template>
          </Dropdown>
        </div>
      </div>
    </template>
    <template #body>
      <RouterView v-slot="{ Component, route }">
        <CloneView v-if="clone" />
        <component
          v-else-if="route.name !== 'pricelistsIndex'"
          :is="Component"
        ></component>
        <IndexView
          v-else-if="selectedPriceList && selectedEdition"
          :priceList="selectedPriceList"
          :edition="selectedEdition"
        />
        <template v-else> Выберите прайс лист и редакцию </template>
      </RouterView>
    </template>
  </AppContent>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  &__action {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}

.multiselect {
  flex-basis: 50%;
  margin: 0;
}

.select {
  min-width: 100px;
}

.title {
  padding: 5px;
  display: flex;
  align-items: center;
}

.dropdown-button {
  width: 100%;
}

.bold {
  font-weight: 600;
}
</style>

<style lang="scss">
.first {
  min-width: 500px;
}
.p-treetable-wrapper {
  @include darkScroll;
}
</style>
