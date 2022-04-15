<script>
import AppSidebar from '@/components/Layout/AppSidebar.vue'
import AppContainer from '@/components/Layout/AppContainer.vue'
import { mapActions } from 'vuex'

export default {
  components: { AppSidebar, AppContainer },
  data() {
    return {
      loading: false,
    }
  },
  async mounted() {
    this.loading = true
    await Promise.all([
      this.fetchDirectories(),
      this.fetchEditions(),
      this.fetchPriceLists(),
    ])
    this.loading = false
  },
  methods: {
    ...mapActions('directory', {
      fetchDirectories: 'fetchAll',
    }),
    ...mapActions('edition', {
      fetchEditions: 'fetchAll',
    }),
    ...mapActions('priceList', {
      fetchPriceLists: 'fetchAll',
    }),
  },
}
</script>

<template>
  <main v-if="!loading" class="main">
    <AppSidebar />
    <AppContainer />
  </main>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: min-content 1fr;
}
</style>
