<script>
import AdminLeftbar from '@/components/Admin/AdminLeftbar.vue'
import { mapActions } from 'vuex'

export default {
  components: { AdminLeftbar },
  data() {
    return {
      loading: true,
    }
  },
  computed: {
    pageTitle() {
      return this.$route.meta.title
    },
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
    <div class="admin-view__content">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-view {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 200px 1fr;

  &__content {
    height: 100%;
    overflow-y: auto;
    padding: 10px;
  }
}
</style>
