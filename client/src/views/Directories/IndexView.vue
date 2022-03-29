<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import SquaredPlusIcon from '@/components/UI/Icons/SquaredPlusIcon.vue'
import DataTable from '@/components/Directories/DataTable.vue'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    SquaredPlusIcon,
    DataTable,
  },
  data() {
    return {
      search: '',
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'selectedDirectory', 'parent']),
  },
  async mounted() {
    await this.fetchAll()
  },
  methods: {
    ...mapMutations('directory', [
      'createSubdirectory',
      'setSelectedDirectory',
      'createArchitecture',
    ]),
    ...mapActions('directory', ['createDirectory', 'fetchAll']),
    openCreateModal() {
      this.createDirectory('Название папки')
    },
    createSubfolder() {
      this.createSubdirectory('Название папки')
    },
  },
}
</script>

<template>
  <AppContent>
    <template #header>
      <span class="page-title">
        Справочники
        <span v-if="parent" @click="setSelectedDirectory(parent)"> </span>
      </span>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
        <AppButton outlined @click="openCreateModal">
          <div class="button-create">
            <SquaredPlusIcon />
            <span> Создать </span>
          </div>
        </AppButton>
      </div>
    </template>
    <template #body-content>
      <div v-if="!selectedDirectory" class="directories">
        <DirectoryList :items="directories" @create="openCreateModal" />
      </div>
      <div
        v-else-if="selectedDirectory.dirs.length > 0 && !selectedDirectory.data"
        class="directories"
      >
        <DirectoryList
          :parent="selectedDirectory"
          :items="selectedDirectory.dirs"
          @create="createSubfolder"
        />
      </div>
      <div v-else-if="!selectedDirectory.data">
        <AppButton outlined @click="createArchitecture">
          Создать архитекруту
        </AppButton>
        <AppButton outlined> Создать папку </AppButton>
      </div>
      <div v-else>
        <DataTable
          :keys="selectedDirectory.data.keys"
          :values="selectedDirectory.data.values"
        />
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
