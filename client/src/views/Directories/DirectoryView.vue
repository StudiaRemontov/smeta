<script>
import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import CreateButton from '@/components/Directories/CreateButton.vue'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    CreateButton,
  },
  provide() {
    return {
      parent: this.directory,
    }
  },
  data() {
    return {
      search: '',
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'selectedDirectory']),
  },
  methods: {
    ...mapMutations('directory', ['createSubdirectory', 'createArchitecture']),
    async createDirectory() {
      const response = await this.$refs['create-directory'].show({
        title: 'Создать папку',
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (response) {
        this.createSubdirectory({
          dirId: this.directory.id,
          name: response,
        })
      }
    },
  },
}
</script>

<template>
  <AppContent>
    <template #header>
      <span class="page-title"> Справочники {{ selectedDirectory.name }} </span>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
      </div>
    </template>
    <template #body-content>
      <div
        v-if="!selectedDirectory.dirs.length && !selectedDirectory.data"
        class="choose"
      >
        <CreateButton text="Создать папку" @click="createDirectory" />
        <CreateButton
          text="Создать архитектуру"
          @click="createArchitecture(selectedDirectory.id)"
        />
      </div>
      <div
        v-else-if="selectedDirectory.dirs.length && !selectedDirectory.data"
        class="directories"
      >
        <DirectoryList
          :items="selectedDirectory.dirs"
          @create="createDirectory"
        />
      </div>
      <div v-else class="architecture">
        <span> Архитектура</span>
        {{ selectedDirectory }}
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

.choose {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
