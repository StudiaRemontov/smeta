<script>
import MainLayout from '@/layouts/MainLayout.vue'
import OutlayLayout from '@/layouts/OutlayLayout.vue'
import PrintLayout from '@/layouts/PrintLayout.vue'
import Toast from 'primevue/toast'

import { mapActions } from 'vuex'

export default {
  components: { MainLayout, OutlayLayout, PrintLayout, Toast },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    layout() {
      return this.$route?.meta?.layout || 'MainLayout'
    },
  },
  async mounted() {
    this.loading = true
    try {
      await this.initApp()
      await Promise.all([
        this.fetchDirectories(),
        this.fetchEditions(),
        this.fetchPriceLists(),
      ])
    } catch (error) {
      this.$toast.add({
        severity: 'error',
        summary: 'Ошибка при получении данных с сервера',
        life: 3000,
      })
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['initApp']),
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
  <component v-if="!loading" :is="layout"></component>
  <Toast position="top-center" />
</template>
