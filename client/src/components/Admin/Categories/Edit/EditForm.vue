<script>
import { mapActions, mapGetters } from 'vuex'
import draggable from 'vuedraggable'

import SubcategoryItem from '../SubcategoryItem.vue'

export default {
  components: {
    SubcategoryItem,
    draggable,
  },
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      name: '',
      subcategories: [],
      clonedSubcategories: [],
    }
  },
  computed: {
    ...mapGetters('subcategory', {
      allSubcategories: 'subcategories',
    }),
  },
  mounted() {
    const clone = JSON.parse(JSON.stringify(this.category))

    this.name = clone.name
    this.subcategories = clone.subCategories.map(id => {
      return this.allSubcategories.find(subcategory => subcategory._id === id)
    })
    this.clonedSubcategories = JSON.parse(JSON.stringify(this.allSubcategories))
    this.clonedSubcategories = this.clonedSubcategories.filter(s => {
      return !this.category.subCategories.includes(s._id)
    })
  },
  methods: {
    ...mapActions('category', ['update']),
    async submitHandler() {
      const subCategories = this.subcategories.map(({ _id }) => _id)
      const data = {
        name: this.name,
        subCategories,
      }
      try {
        await this.update({ id: this.category._id, data })
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
          :list="subcategories"
          style="min-height: 100px"
          group="subcategories"
          item-key="_id"
        >
          <template #item="{ element }">
            <SubcategoryItem :subcategory="element" />
          </template>
        </draggable>
      </div>
      <div class="create-form__list">
        <span> Все подкатегории </span>
        <draggable
          :list="clonedSubcategories"
          style="min-height: 100px"
          group="subcategories"
          item-key="_id"
        >
          <template #item="{ element }">
            <SubcategoryItem :subcategory="element" />
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
