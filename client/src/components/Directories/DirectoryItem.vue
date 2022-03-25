<script>
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'

export default {
  components: {
    ThreeDotsIcon,
  },
}
</script>

<template>
  <li class="directory-item">
    <div class="directory-item__content">
      <span class="directory-item__name"> Name </span>
      <span class="directory-item__counter"> Нет элементов </span>
    </div>
    <div class="directory-item__controlls">
      <AppButton>
        <ThreeDotsIcon />
      </AppButton>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.directory-item {
  border: 1px solid #a7a7a7;
  border-radius: 10px;
  display: flex;
  padding: 20px 15px 15px;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__name {
    flex: 1;
    font-size: $font-medium;
    font-weight: 700;
  }

  &__counter {
    font-weight: 700;
    font-size: $font-small;
    line-height: 15px;
    color: #808080;
  }
}
</style>
