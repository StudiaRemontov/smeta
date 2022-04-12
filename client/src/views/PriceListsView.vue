<script>
import AppContent from '@/components/Layout/AppContent.vue'
import IndexView from './PriceLists/IndexView.vue'
import Multiselect from '@vueform/multiselect'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AppContent,
    Multiselect,
    IndexView,
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
      this.$refs['select-edition'].close()
    },
    goToIndex(value) {
      this.setSelectedEdition(value)
      this.$router.push('/pricelists')
    },
    inputPriceListHandler(value) {
      this.setSelectedPriceList(value)
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
        <Multiselect
          :value="selectedPriceList?._id"
          ref="select-priceList"
          :options="priceListOptions"
          class="multiselect"
          searchable
          @input="inputPriceListHandler"
        >
          <template #beforelist>
            <input
              v-model="priceListName"
              type="text"
              @keydown.enter="createPriceList"
            />
          </template>
        </Multiselect>
        <Multiselect
          :disabled="!selectedPriceList"
          :value="selectedEdition?._id"
          ref="select-edition"
          :options="editionOptions"
          class="multiselect"
          searchable
          @input="goToIndex"
        >
          <template #beforelist>
            <AppButton outlined @click="goToCreateEdition">Создать</AppButton>
          </template>
        </Multiselect>
      </div>

      <span class="page-title title"> Прайс лист </span>
    </template>
    <template #body>
      <RouterView v-slot="{ Component, route }">
        <component
          v-if="route.name === 'createEdition'"
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
</style>
