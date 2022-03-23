<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isSubcategoriesVisible: false,
    }
  },
  computed: {
    ...mapGetters('subcategory', ['subcategories']),
    subCategories() {
      return this.category.subCategories.map(subcategory => {
        return this.subcategories.find(s => s._id === subcategory)
      })
    },
  },
}
</script>

<template>
  <li class="category-item">
    <div class="category-item__header">
      <span
        class="category-item__title"
        @click="isSubcategoriesVisible = !isSubcategoriesVisible"
      >
        {{ category.name }}</span
      >
      <AppButton
        variant="primary"
        :to="{ name: 'categoriesEdit', params: { id: category._id } }"
      >
        Редактировать
      </AppButton>
    </div>

    <ul v-if="isSubcategoriesVisible" class="category-item__subcategories">
      <li
        v-for="subcategory in subCategories"
        :key="subcategory._id"
        class="category-item__subcategory"
      >
        {{ subcategory.name }}
      </li>
    </ul>
  </li>
</template>

<style lang="scss" scoped>
.category-item {
  background-color: #fff;
  padding: 10px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: $font-medium;
  }

  &__subcategories {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__subcategory {
    border: 1px #ccc solid;
    padding: 10px;
  }
}
</style>
