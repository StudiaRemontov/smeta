<script>
import AppContent from '@/components/Layout/AppContent.vue'
import VueSelect from 'vue-select'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    AppContent,
    VueSelect,
  },
  data() {
    return {
      selectedPriceList: null,
      priceListName: '',
      loading: true,
    }
  },
  computed: {
    ...mapGetters('priceList', ['priceLists']),
    ...mapGetters('edition', ['editions']),
    priceListOptions() {
      return this.priceLists.map(item => ({
        label: item.name,
        value: item,
      }))
    },
    editionOptions() {
      if (!this.selectedPriceList) {
        return []
      }
      const editions = this.editions.filter(edition => {
        return this.selectedPriceList.value.editions.includes(edition._id)
      })

      return editions.map(edition => ({
        label: edition.name,
        value: edition,
      }))
    },
  },
  async mounted() {
    await Promise.all([this.fetchPriceLists(), this.fetchEditions()])
    this.loading = false
  },
  methods: {
    ...mapActions('priceList', {
      fetchPriceLists: 'fetchAll',
    }),
    ...mapActions('edition', {
      fetchEditions: 'fetchAll',
    }),
    setInput(val) {
      this.priceListName = val
    },
    createPriceList() {
      const data = {
        name: this.priceListName,
      }
      console.log(data)
    },
    goToCreateEdition() {
      this.$router.push('/pricelists/create')
    },
  },
}
</script>

<template>
  <AppContent v-if="!loading">
    <template #header>
      <VueSelect
        v-model="selectedPriceList"
        @search="setInput"
        :options="priceListOptions"
      >
        <template #list-header>
          <button @click="createPriceList">Создать</button>
        </template>
      </VueSelect>
      <VueSelect v-if="selectedPriceList" :options="editionOptions">
        <template #list-header>
          <button @click="goToCreateEdition">Создать</button>
        </template>
      </VueSelect>
      <span class="page-title title"> Прайс лист </span>
    </template>
    <template #body>
      <RouterView />
    </template>
  </AppContent>
</template>

<style lang="scss" scoped>
.title {
  padding: 5px;
  display: flex;
  align-items: center;
}
</style>
