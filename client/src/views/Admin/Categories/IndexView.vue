<script>
import { mapGetters } from 'vuex'

import CategoryList from '@/components/Admin/Categories/CategoryList.vue'

export default {
  components: { CategoryList },
  computed: {
    ...mapGetters('category', ['categories']),
  },
}
</script>

<template>
  <div>
    <AppButton variant="primary" :to="{ name: 'categoriesAdd' }"
      >Добавить категорию</AppButton
    >
    <span v-if="!categories.length"> Категорий нету </span>
    <CategoryList v-else :categories="categories" />
  </div>
</template>

<style></style>
