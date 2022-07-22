<script>
import ContentBody from '@/components/Layout/App/ContentBody.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import { mapGetters } from 'vuex'

export default {
  components: { ContentBody, SearchInput, DirectoryList },
  data() {
    return {
      search: '',
    }
  },
  computed: {
    ...mapGetters('directory', ['roots']),
  },
}
</script>

<template>
  <ContentBody>
    <template #header>
      <SearchInput class="search-input" />
    </template>
    <template #content>
      <DirectoryList :items="roots" />
    </template>
  </ContentBody>
</template>

<style lang="scss" scoped>
.search-input {
  max-width: 400px;
  width: 100%;
}
</style>
