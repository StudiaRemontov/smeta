<script>
import { mapActions, mapGetters } from 'vuex'
import draggable from 'vuedraggable'

import SubcategoryItem from '../SubcategoryItem.vue'

const getInitState = () => ({
  name: '',
  subcategories: [],
})

export default {
  components: {
    SubcategoryItem,
    draggable,
  },
  data() {
    return {
      ...getInitState(),
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
    this.clonedSubcategories = JSON.parse(JSON.stringify(this.allSubcategories))
  },
  methods: {
    ...mapActions('category', ['create']),
    async submitHandler() {
      const subCategories = this.subcategories.map(({ _id }) => _id)
      const data = {
        name: this.name,
        subCategories,
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
      this.clonedSubcategories = JSON.parse(
        JSON.stringify(this.allSubcategories),
      )
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
