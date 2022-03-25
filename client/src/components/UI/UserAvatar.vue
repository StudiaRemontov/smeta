<script>
export default {}
</script>

<template>
  <div class="user-avatar">
    <span class="user-avatar__name"> CPP </span>
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $color-light;

  &__name {
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    margin: auto;
  }
}
</style>
