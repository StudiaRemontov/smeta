<script>
import ContentBody from '@/components/Layout/ContentBody.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import OutlayList from '@/components/Outlays/OutlayList.vue'

export default {
  components: {
    ContentBody,
    SearchInput,
    OutlayList,
  },
}
</script>

<template>
  <ContentBody>
    <template #header>
      <div class="header">
        <SearchInput />
      </div>
    </template>
    <template #content>
      <OutlayList />
    </template>
  </ContentBody>
</template>

<style></style>
