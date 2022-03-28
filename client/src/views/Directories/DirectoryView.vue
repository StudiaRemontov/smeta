<script>
import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import CreateDirectory from '@/components/Directories/Modals/CreateModal.vue'
import CreateButton from '@/components/Directories/CreateButton.vue'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    CreateDirectory,
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
    ...mapGetters('directory', ['isCreateModalVisible', 'directories']),
    name() {
      return this.$route.params.name
    },
    directory() {
      return this.directories.find(d => d.name === this.name)
    },
  },
  methods: {
    ...mapMutations('directory', [
      'setIsCreateModalVisible',
      'createSubdirectory',
      'createArchitecture',
    ]),
    openCreateModal() {
      this.setIsCreateModalVisible(true)
    },
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
      <span class="page-title"> Справочники {{ name }} </span>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
      </div>
    </template>
    <template #body-content>
      <CreateDirectory ref="create-directory" />
      <div v-if="!directory.dirs.length && !directory.data" class="choose">
        <CreateButton text="Создать папку" @click="createDirectory" />
        <CreateButton
          text="Создать архитектуру"
          @click="createArchitecture(directory.id)"
        />
      </div>
      <div
        v-else-if="directory.dirs.length && !directory.data"
        class="directories"
      >
        <DirectoryList :items="directory.dirs" @create="createDirectory" />
      </div>
      <div v-else class="architecture">
        <span> Архитектура</span>
        {{ directory }}
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
