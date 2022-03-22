<script>
import SubcategoryTable from '@/components/Admin/Subcategory/SubcategoryTable.vue'

export default {
  components: { SubcategoryTable },
  computed: {
    subcategories() {
      return this.$store.getters['subcategory/subcategories']
    },
  },
}
</script>

<template>
  <div>
    <AppButton variant="primary" to="/admin/subcategories/add">
      Добавить подкатегорию
    </AppButton>
    <SubcategoryTable :data="subcategories" />
  </div>
</template>
