<script>
export default {
  inject: ['keys'],
  computed: {
    gridStyleRepeat() {
      //без первого ключа
      const keysLength = this.keys.length - 1
      return keysLength
    },
  },
}
</script>

<template>
  <div class="table-row-wrapper">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.table-row-wrapper {
  display: grid;
  grid-template-columns: 1fr repeat(v-bind(gridStyleRepeat), 100px);
  align-items: center;

  &:hover {
    cursor: pointer;
  }
}
</style>
