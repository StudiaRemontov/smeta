<script>
export default {
  props: {
    subcategory: {
      type: Object,
      required: true,
    },
  },
}
</script>

<template>
  <div class="subcategory-item">
    <span class="subcategory-item__name">
      {{ subcategory.name }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.subcategory-item {
  padding: 10px;
  background-color: #fff;
  border: 1px #ddd solid;
  cursor: move;
}
</style>
