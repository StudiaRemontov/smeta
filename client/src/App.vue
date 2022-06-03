<script>
import MainLayout from '@/layouts/MainLayout.vue'
import OutlayLayout from '@/layouts/OutlayLayout.vue'
import PrintLayout from '@/layouts/PrintLayout.vue'

import { mapActions } from 'vuex'

export default {
  components: { MainLayout, OutlayLayout, PrintLayout },
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
  <component v-if="!loading" :is="layout"></component>
</template>
