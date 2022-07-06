<script>
import { mapGetters } from 'vuex'
import CategoryItem from './CategoryItem.vue'

export default {
  name: 'CategoryList',
  components: { CategoryItem },
  props: {
    categories: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapGetters('acts', ['activeRoom', 'changeView']),
    categoryList() {
      if (this.changeView) {
        return this.categories[0].jobs.filter(r => r.sum)
      }
      if (this.activeRoom) {
        const room = this.categories.find(r => r.id === this.activeRoom.id)
        return room.jobs.filter(r => r.sum)
      }
      return [...this.categories].reverse()
    },
  },
}
</script>
<template>
  <div class="category-list">
    <CategoryItem
      v-for="category in categoryList"
      :key="category.id"
      :category="category"
    />
  </div>
</template>

<style lang="scss" scoped>
.category-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: auto;
  @include darkScroll;
  padding: 12px;
}
</style>
