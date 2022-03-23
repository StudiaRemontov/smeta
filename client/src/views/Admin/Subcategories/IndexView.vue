<script>
import SubcategoryTable from '@/components/Admin/Subcategories/SubcategoryTable.vue'
import { mapGetters } from 'vuex'

export default {
  components: { SubcategoryTable },
  computed: {
    ...mapGetters('subcategory', ['subcategories']),
  },
}
</script>

<template>
  <div>
    <AppButton variant="primary" :to="{ name: 'subcategoriesAdd' }">
      Добавить подкатегорию
    </AppButton>
    <SubcategoryTable :data="subcategories" />
  </div>
</template>
