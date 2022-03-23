<script>
import CategoryItem from './CategoryItem.vue'

export default {
  components: { CategoryItem },
  props: {
    categories: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <ul class="category-list">
    <CategoryItem
      v-for="category in categories"
      :key="category._id"
      :category="category"
    />
  </ul>
</template>

<style lang="scss" scoped>
.category-list {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}
</style>
