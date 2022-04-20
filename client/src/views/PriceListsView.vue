<script>
import AppContent from '@/components/Layout/AppContent.vue'
import IndexView from './PriceLists/IndexView.vue'
import CloneView from './PriceLists/CloneView.vue'
import IndexActions from '@/components/PriceLists/Actions/IndexActions.vue'
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
    IndexActions,
  },
  mixins: [rootGetters, keyTypes],
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    ...mapGetters('directory', ['roots', 'directories']),
    ...mapGetters('priceList', ['priceLists', 'selectedPriceList']),
    ...mapGetters('edition', [
      'editions',
      'selectedEdition',
      'clone',
      'active',
    ]),
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
        label: `${edition.name} от ${new Date(
          edition.date,
        ).toLocaleDateString()}`,
        value: edition._id,
      }))
    },
  },
  watch: {
    selectedPriceList(value) {
      if (!value && this.priceLists.length === 0) {
        return this.$router.push('/pricelists/create')
      }
      if (!value && this.$route.name !== 'createEdition') {
        this.setData()
      }
    },
    selectedEdition(value) {
      if (!value && this.$route.name !== 'createEdition') {
        this.setData()
      }
    },
  },
  async mounted() {
    if (this.priceLists.length === 0) {
      this.$router.push({ name: 'createEdition' })
    }
    this.createClonedDirectories()
    this.setData()
    this.loading = false
  },
  methods: {
    ...mapMutations('edition', ['setSelectedEdition', 'setClonedDirectories']),
    ...mapMutations('priceList', ['setSelectedPriceList']),
    ...mapActions('priceList', {
      create: 'create',
    }),
    async goToCreateEdition() {
      await this.$router.push({ name: 'createEdition' })
      this.setSelectedEdition(null)
      this.$refs['dropdown-edition'].hide()
    },
    async goToCreatePriceList() {
      await this.$router.push({ name: 'createEdition' })
      this.setSelectedPriceList(null)
      this.setSelectedEdition(null)
      this.$refs['dropdown-priceList'].hide()
    },
    goToIndex() {
      this.$router.push('/pricelists')
      this.$refs['dropdown-edition'].hide()
    },
    priceListChangeHandler() {
      this.setData()
      const selectedId =
        this.active?._id ||
        this.selectedPriceList.editions[
          this.selectedPriceList.editions.length - 1
        ]

      this.setSelectedEdition(selectedId)
      this.$router.push({ name: 'pricelistsIndex' })
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
      if (!this.selectedEdition) {
        const selectedId =
          this.active?._id ||
          this.selectedPriceList.editions[
            this.selectedPriceList.editions.length - 1
          ]

        this.setSelectedEdition(selectedId)
      }
    },
    getValueOfCell(dirId, rowId, keys) {
      const directory = this.roots.find(d => d._id === dirId)

      if (!directory) return null
      const visibleKeys = directory.keys.filter(k => keys.includes(k.id))

      return visibleKeys.map(key => {
        const row = directory.values.find(r => r.id === +rowId)
        if (!row) return null
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
            const selectKey = keysTypeSelect.find(k => k.id === key)
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
  },
}
</script>

<template>
  <AppContent v-if="!loading">
    <template #header>
      <div class="header">
        <div class="header__action-group">
          <div class="header__action">
            <label class="bold">Прайс лист</label>
            <Dropdown
              v-model="selectedPriceListId"
              ref="dropdown-priceList"
              @change="priceListChangeHandler"
              :options="priceListOptions"
              :disabled="!!clone"
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
              :disabled="!!clone"
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
        <IndexActions
          v-if="$route.name === 'pricelistsIndex' && !clone"
          class="header__action-group"
        >
        </IndexActions>
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
      </RouterView>
    </template>
  </AppContent>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__action {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }
  }
}

.dropdown-button {
  width: 100%;
}

.bold {
  font-weight: 600;
}
</style>

<style lang="scss">
.p-treetable-wrapper {
  .first {
    flex: 1 !important;
    min-width: 500px;
  }

  .secondary {
    min-width: 200px;
    flex: 0 0 auto !important;
  }
}

.p-treetable-wrapper {
  @include darkScroll;
}
</style>
