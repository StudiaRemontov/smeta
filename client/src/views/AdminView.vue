<script>
import { mapActions } from 'vuex'

import AdminLeftbar from '@/components/Admin/AdminLeftbar.vue'
import AdminSubpage from '@/components/Admin/AdminSubpage.vue'

export default {
  components: { AdminLeftbar, AdminSubpage },
  data() {
    return {
      loading: true,
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchSubcategories(),
      this.fetchCategories(),
      this.fetchRooms(),
    ])
    this.loading = false
  },
  methods: {
    ...mapActions('subcategory', {
      fetchSubcategories: 'fetchAll',
    }),
    ...mapActions('category', {
      fetchCategories: 'fetchAll',
    }),
    ...mapActions('roomType', {
      fetchRooms: 'fetchAll',
    }),
  },
}
</script>

<template>
  <div class="admin-view">
    <AdminLeftbar />
    <span v-if="loading"> Загрузка </span>
    <AdminSubpage v-else />
  </div>
</template>

<style lang="scss" scoped>
.admin-view {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 200px 1fr;
}
</style>
