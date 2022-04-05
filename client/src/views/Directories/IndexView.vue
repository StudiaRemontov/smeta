<script>
import { mapGetters } from 'vuex'

import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
  },
  data() {
    return {
      search: '',
    }
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
      <span class="page-title title"> Справочники </span>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput class="search-input" />
      </div>
    </template>
    <template #body-content>
      <div class="directories">
        <DirectoryList :items="parentDirectories" />
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
