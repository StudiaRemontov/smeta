<script>
import { mapGetters } from 'vuex'
import AppContent from '@/components/Layout/AppContent.vue'
import NavigationLinks from '@/components/Directories/NavigationLinks.vue'

export default {
  components: {
    AppContent,
    NavigationLinks,
  },
  computed: {
    ...mapGetters('directory', ['directories']),
    parentDirectories() {
      return this.directories.filter(d => d.parent === null)
    },
  },
}
</script>

<template>
  <AppContent>
    <template #header>
      <NavigationLinks />
    </template>
    <template #body>
      <RouterView />
    </template>
  </AppContent>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 400px;
  width: 100%;
}

.button-create {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 9px;
}

.title {
  padding: 5px;
  display: flex;
  align-items: center;
}
</style>
