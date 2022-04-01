<script>
import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import DirectoryForm from '@/components/Directories/DirectoryForm.vue'
import CreateButton from '@/components/Directories/CreateButton.vue'
import DataTable from '@/components/Directories/DataTable.vue'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    CreateButton,
    DirectoryForm,
    DataTable,
  },
  data() {
    return {
      search: '',
      showCreateFolder: false,
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'selectedDirectory']),
    directoryId() {
      return this.$route.params.id
    },
    directory() {
      if (!this.directoryId) {
        return null
      }

      return this.directories.find(
        directory => directory._id === this.directoryId,
      )
    },
    subFolders() {
      if (!this.directory) {
        return []
      }

      return this.directories.filter(d => d.parent === this.directory._id)
    },
    parentTree() {
      if (!this.directory) {
        return null
      }

      return this.getParentTree(this.directory)
    },
  },
  methods: {
    ...mapActions('directory', ['updateById']),
    getParentTree(directory) {
      if (directory.parent) {
        const parent = this.directories.find(
          ({ _id }) => _id === directory.parent,
        )
        return [...this.getParentTree(parent), directory]
      }
      return [directory]
    },
    openCreateDirectory() {
      this.showCreateFolder = true
    },
    async createArchitecture() {
      try {
        await this.updateById({
          id: this.directory._id,
          data: {
            data: {
              keys: [],
              values: [],
            },
          },
        })
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <AppContent v-if="directory">
    <template #header>
      <div class="links">
        <RouterLink class="link" to="/directories">
          <span class="link__text"> Справочники </span>
          <span class="link__delimeter">/</span></RouterLink
        >
        <template v-if="parentTree">
          <RouterLink
            v-for="(parent, index) in parentTree"
            :key="parent._id"
            :to="`/directories/${parent._id}`"
            class="link"
          >
            <span class="link__text">
              {{ parent.name }}
            </span>
            <span v-if="index < parentTree.length - 1" class="link__delimeter"
              >/</span
            >
          </RouterLink>
        </template>
      </div>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
      </div>
    </template>
    <template #body-content>
      <div class="create-form" v-if="showCreateFolder">
        <DirectoryForm
          :parent="this.directory._id"
          @created="showCreateFolder = false"
        />
      </div>
      <div v-else-if="!subFolders.length && !directory.data" class="choose">
        <CreateButton text="Создать папку" @click="openCreateDirectory" />
        <CreateButton text="Создать архитектуру" @click="createArchitecture" />
      </div>
      <div v-else-if="subFolders.length && !directory.data" class="directories">
        <DirectoryList :items="subFolders" />
      </div>
      <div v-else>
        <DataTable :directory="directory" />
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

.create-form {
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 130px;
  gap: 20px;
}

.links {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
}

.link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;

  &__text {
    font-weight: 700;
    color: #000;
    font-size: $font-high;
  }

  &__delimeter {
    font-weight: 700;
  }
}
</style>
