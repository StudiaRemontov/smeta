<script>
import AppContent from '@/components/Layout/AppContent.vue'
import NavigationLinks from '@/components/Directories/NavigationLinks.vue'

export default {
  components: {
    AppContent,
    NavigationLinks,
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
