<script>
import { mapActions, mapGetters } from 'vuex'
import draggable from 'vuedraggable'

import CategoryItem from '../CategoryItem.vue'

export default {
  components: {
    CategoryItem,
    draggable,
  },
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      name: '',
      categories: [],
      clonedCategories: [],
    }
  },
  computed: {
    ...mapGetters('category', {
      allSubcategories: 'categories',
    }),
  },
  mounted() {
    const clone = JSON.parse(JSON.stringify(this.room))

    this.name = clone.name
    this.categories = clone.categories.map(id => {
      return this.allSubcategories.find(subcategory => subcategory._id === id)
    })
    this.clonedCategories = JSON.parse(JSON.stringify(this.allSubcategories))
    this.clonedCategories = this.clonedCategories.filter(s => {
      return !this.room.categories.includes(s._id)
    })
  },
  methods: {
    ...mapActions('roomType', ['update']),
    async submitHandler() {
      const categories = this.categories.map(({ _id }) => _id)
      const data = {
        name: this.name,
        categories,
      }
      try {
        await this.update({ id: this.room._id, data })
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <form class="create-form" @submit.prevent="submitHandler">
    <div class="create-form__group">
      <label class="create-form__label"> Название </label>
      <input v-model="name" class="create-form__input input" type="text" />
    </div>
    <AppButton variant="primary">Сохранить</AppButton>

    <div class="create-form__lists">
      <div class="create-form__list">
        <span> Добавленные подкатегории </span>
        <draggable
          :list="categories"
          style="min-height: 100px"
          group="categories"
          item-key="_id"
        >
          <template #item="{ element }">
            <CategoryItem :category="element" />
          </template>
        </draggable>
      </div>
      <div class="create-form__list">
        <span> Все подкатегории </span>
        <draggable
          :list="clonedCategories"
          style="min-height: 100px"
          group="categories"
          item-key="_id"
        >
          <template #item="{ element }">
            <CategoryItem :category="element" />
          </template>
        </draggable>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.create-form {
  &__lists {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  &__list {
    flex: 1;
  }
}
</style>
