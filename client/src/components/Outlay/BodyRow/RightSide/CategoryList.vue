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
    ...mapGetters('outlay', ['roomsData', 'selectedRoom']),
    categoryList() {
      if (this.selectedRoom) {
        const room = this.categories.find(r => r.id === this.selectedRoom.id)
        return room.jobs
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
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: auto;
  @include darkScroll;
}
</style>
