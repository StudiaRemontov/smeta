<script>
export default {
  methods: {
    openFolder() {
      this.$router.push('/outlay/1')
    },
  },
}
</script>

<template>
  <li class="outlay-item" @dblclick="openFolder">
    <div class="outlay-item__header">
      <span class="outlay-item__name"> temp name </span>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.outlay-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #808080;
  border-radius: 10px;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__name {
    font-size: $font-medium;
    font-weight: 700;
    word-break: break-word;
    user-select: auto;
  }
}
</style>
