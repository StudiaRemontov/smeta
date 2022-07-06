<script>
import MainLayout from '@/layouts/MainLayout.vue'
import OutlayLayout from '@/layouts/OutlayLayout.vue'
import PrintLayout from '@/layouts/PrintLayout.vue'
import ActLayout from '@/layouts/ActLayout.vue'
import Toast from 'primevue/toast'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: { MainLayout, OutlayLayout, ActLayout, PrintLayout, Toast },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['isOffline']),
    layout() {
      return this.$route?.meta?.layout || 'MainLayout'
    },
  },
  watch: {
    isOffline(value) {
      if (!value) {
        //mb loader
        this.fetchData()
      }
    },
  },
  async mounted() {
    this.loading = true
    await this.initApp()
    await this.fetchData()
    navigator.connection.addEventListener('change', this.onConnectionChange)
    this.loading = false
  },
  unmounted() {
    navigator.connection.removeEventListener('change', this.onConnectionChange)
  },
  methods: {
    ...mapMutations(['setIsOffline']),
    ...mapActions(['initApp', 'fetchAll']),
    async fetchData() {
      try {
        await this.fetchAll()
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
    async onConnectionChange() {
      const status = navigator.onLine
      this.setIsOffline(!status)
    },
  },
}
</script>

<template>
  <component v-if="!loading" :is="layout"></component>
  <Toast position="top-center" />
</template>
