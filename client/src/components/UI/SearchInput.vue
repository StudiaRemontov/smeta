<script>
import AppInput from './AppInput.vue'
import SearchIcon from './Icons/SearchIcon.vue'

export default {
  components: { AppInput, SearchIcon },
}
</script>

<template>
  <div class="search-input">
    <SearchIcon />
    <AppInput placeholder="Search" />
  </div>
</template>

<style lang="scss" scoped>
.search-input {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: $color-light;
  border: 1px solid #a7a7a7;
  border-radius: 3px;
}
</style>
