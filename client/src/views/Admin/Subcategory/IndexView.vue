<script>
import SubcategoryTable from '@/components/Admin/Subcategory/SubcategoryTable.vue'

export default {
  components: { SubcategoryTable },
  data() {
    return {
      subcategories: [
        {
          id: 1,
          name: 'Полы',
          jobs: [
            {
              name: 'Уборка',
              unit: 'м2',
              price: 10.12,
            },
            {
              name: 'Уборка 2',
              unit: 'м2',
              price: 14.12,
            },
          ],
        },
      ],
    }
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
