<script>
import AppContent from '@/components/Layout/AppContent.vue'
import IndexView from './PriceLists/IndexView.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

import Dropdown from 'primevue/dropdown'

export default {
  components: {
    AppContent,
    IndexView,
    Dropdown,
  },
  data() {
    return {
      priceListName: '',
      loading: true,
    }
  },
  computed: {
    ...mapGetters('priceList', ['priceLists', 'selectedPriceList']),
    ...mapGetters('edition', ['editions', 'selectedEdition']),
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
    this.loading = false
  },
  methods: {
    ...mapMutations('edition', ['setSelectedEdition']),
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
      this.$router.push('/pricelists/create')
    },
    goToIndex() {
      this.$router.push('/pricelists')
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
        <Dropdown
          v-model="selectedPriceListId"
          :options="priceListOptions"
          :filter="true"
          :editable="true"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите прайс лист"
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
        <Dropdown
          v-model="selectedEditionId"
          :options="editionOptions"
          :filter="true"
          :editable="true"
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

      <span class="page-title title"> Прайс лист </span>
    </template>
    <template #body>
      <RouterView v-slot="{ Component, route }">
        <component
          v-if="route.name !== 'pricelistsIndex'"
          :is="Component"
        ></component>
        <IndexView
          v-else-if="selectedPriceList && selectedEdition"
          :priceList="selectedPriceList"
          :edition="selectedEdition"
        />
        <template v-else> Прайс листы еще не созданы </template>
      </RouterView>
    </template>
  </AppContent>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
</style>
