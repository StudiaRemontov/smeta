<script>
import PlusIcon from '../UI/Icons/PlusIcon.vue'

export default {
  components: {
    PlusIcon,
  },
}
</script>

<template>
  <li class="directory-create">
    <div class="directory-create__body">
      <PlusIcon />
      <span class="directory-create__text"> Добавить папку </span>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.directory-create {
  border: 1px solid #a7a7a7;
  border-radius: 10px;
  display: flex;
  padding: 20px 15px 15px;
  display: flex;
  user-select: none;
  cursor: pointer;

  &__body {
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 7px;
  }

  &__text {
    font-weight: 700;
    line-height: 17px;
    color: #c8c8c8;
  }
}
</style>
