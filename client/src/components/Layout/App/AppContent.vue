<template>
  <div class="app-content">
    <div class="app-content__header">
      <slot name="header" />
    </div>
    <div class="app-content__body">
      <slot name="body" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-content {
  max-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;

  &__body {
    flex: 1;
    background-color: $color-light;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.05);
    border-radius: 5px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    min-height: 0px;

    &-content {
      flex: 1;
      padding-right: 5px;
      overflow-y: auto;
      padding-bottom: 10px;
    }
  }
}
</style>
