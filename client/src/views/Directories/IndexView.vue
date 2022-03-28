<script>
import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import SquaredPlusIcon from '@/components/UI/Icons/SquaredPlusIcon.vue'
import CreateDirectory from '@/components/Directories/Modals/CreateModal.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    SquaredPlusIcon,
    CreateDirectory,
  },
  data() {
    return {
      search: '',
    }
  },
  computed: {
    ...mapGetters('directory', ['isCreateModalVisible']),
  },
  methods: {
    ...mapMutations('directory', ['setIsCreateModalVisible']),
    ...mapActions('directory', ['createDirectory']),
    async openCreateModal() {
      const response = await this.$refs['create-modal'].show({
        title: 'Создать папку',
        okButton: 'Создать',
        cancelButton: 'отмена',
      })
      this.createDirectory(response)
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
        <AppButton outlined @click="openCreateModal">
          <div class="button-create">
            <SquaredPlusIcon />
            <span> Создать </span>
          </div>
        </AppButton>
      </div>
    </template>
    <template #body-content>
      <div class="directories">
        <DirectoryList />
        <CreateDirectory ref="create-modal" />
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
