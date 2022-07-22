<script>
import AppContent from '@/components/Layout/App/AppContent.vue'

export default {
  components: { AppContent },
}
</script>

<template>
  <AppContent>
    <template #header>
      <span class="page-title">Сметы</span>
    </template>
    <template #body>
      <RouterView />
    </template>
  </AppContent>
</template>
