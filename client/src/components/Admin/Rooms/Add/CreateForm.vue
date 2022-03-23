<script>
import { mapActions, mapGetters } from 'vuex'
import draggable from 'vuedraggable'

import CategoryItem from '../CategoryItem.vue'

const getInitState = () => ({
  name: '',
  categories: [],
})

export default {
  components: {
    draggable,
    CategoryItem,
  },
  data() {
    return {
      ...getInitState(),
      categories: [],
      clonedCategories: [],
    }
  },
  computed: {
    ...mapGetters('category', {
      allCategories: 'categories',
    }),
  },
  mounted() {
    this.clonedCategories = JSON.parse(JSON.stringify(this.allCategories))
  },
  methods: {
    ...mapActions('roomType', ['create']),
    async submitHandler() {
      const categories = this.categories.map(({ _id }) => _id)
      const data = {
        name: this.name,
        categories,
      }

      try {
        await this.create(data)
        this.resetForm()
      } catch (error) {
        console.log(error)
      }
    },
    resetForm() {
      Object.assign(this.$data, getInitState())
      this.clonedCategories = JSON.parse(JSON.stringify(this.allCategories))
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
    <AppButton variant="success">Создать</AppButton>

    <div class="create-form__lists">
      <div class="create-form__list">
        <span> Добавленные категории </span>
        <draggable
          :list="categories"
          style="min-height: 100px"
          group="subcategories"
          item-key="_id"
        >
          <template #item="{ element }">
            <CategoryItem :category="element" />
          </template>
        </draggable>
      </div>
      <div class="create-form__list">
        <span> Все категории </span>
        <draggable
          :list="clonedCategories"
          style="min-height: 100px"
          group="subcategories"
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
