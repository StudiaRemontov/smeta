<script>
import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'

export default {
  components: { AppContent, SearchInput, DirectoryList },
}
</script>

<template>
  <AppContent>
    <template #header>
      <span class="page-title"> Справочники </span>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput class="search-input" />
        <AppButton outlined>Создать</AppButton>
      </div>
    </template>
    <template #body-content>
      <div class="directories">
        <DirectoryList />
      </div>
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
</style>
