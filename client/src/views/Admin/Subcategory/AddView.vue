<script>
import CreateForm from '@/components/Admin/Subcategory/Add/CreateForm.vue'

export default {
  components: { CreateForm },
}
</script>

<template>
  <div class="add-view">
    <span class="add-view__title subpage-title">Добавить подкатегорию</span>
    <CreateForm />
  </div>
</template>

<style lang="scss" scoped>
.add-view {
  &__title {
    display: inline-block;
    margin-bottom: 20px;
  }
}
</style>
