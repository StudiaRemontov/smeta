<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isCategoriesVisible: false,
    }
  },
  computed: {
    ...mapGetters('category', ['categories']),
    roomCategories() {
      return this.room.categories.map(category => {
        return this.categories.find(cat => cat._id === category)
      })
    },
  },
}
</script>

<template>
  <li class="category-item">
    <div
      class="category-item__header"
      @click="isCategoriesVisible = !isCategoriesVisible"
    >
      <span class="category-item__title"> {{ room.name }}</span>
      <AppButton
        variant="primary"
        :to="{ name: 'roomsEdit', params: { id: room._id } }"
      >
        Редактировать
      </AppButton>
    </div>

    <ul v-if="isCategoriesVisible" class="category-item__subcategories">
      <li
        v-for="category in roomCategories"
        :key="category._id"
        class="category-item__subcategory"
      >
        {{ category.name }}
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
    cursor: pointer;
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
