<script>
import EditForm from '@/components/Admin/Categories/Edit/EditForm.vue'
import { mapGetters } from 'vuex'

export default {
  components: { EditForm },
  computed: {
    ...mapGetters('category', ['categories']),
    id() {
      return this.$route.params?.id
    },
    category() {
      return this.categories.find(c => c._id === this.id)
    },
  },
}
</script>

<template>
  <span class="subpage-title">Редактировать категорию</span>
  <span v-if="!category">Категория не найдена</span>
  <EditForm v-else :category="category" />
</template>
