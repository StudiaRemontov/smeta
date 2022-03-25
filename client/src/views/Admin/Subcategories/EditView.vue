<script>
import { mapGetters } from 'vuex'
import EditForm from '@/components/Admin/Subcategories/Edit/EditForm.vue'

export default {
  components: { EditForm },

  computed: {
    ...mapGetters('subcategory', ['subcategories']),
    id() {
      return this.$route.params?.id
    },
    subcategory() {
      return this.subcategories.find(subcategory => subcategory._id === this.id)
    },
  },
}
</script>

<template>
  <div class="edit-view">
    <span class="edit-view__title subpage-title"
      >Редактировать подкатегорию</span
    >
    <span v-if="!subcategory"> Данная подкатегория не найдена </span>
    <EditForm v-else :subcategory="subcategory" />
  </div>
</template>

<style lang="scss" scoped>
.edit-view {
  &__title {
    display: inline-block;
    margin-bottom: 20px;
  }
}
</style>
