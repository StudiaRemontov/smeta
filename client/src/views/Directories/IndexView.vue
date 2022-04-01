<script>
import { mapGetters } from 'vuex'

import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import SquaredPlusIcon from '@/components/UI/Icons/SquaredPlusIcon.vue'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    SquaredPlusIcon,
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
      <span class="page-title"> Справочники </span>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
        <AppButton v-if="!parent" outlined>
          <div class="button-create">
            <SquaredPlusIcon />
            <span> Создать </span>
          </div>
        </AppButton>
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
</style>
