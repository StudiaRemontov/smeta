<script>
import AppLogo from '@/components/UI/AppLogo.vue'
import Button from 'primevue/button'

export default {
  components: { AppLogo, Button },
}
</script>

<template>
  <div class="left-side">
    <div class="left-side__header">
      <AppLogo />
    </div>
    <div class="left-side__body">
      <div class="left-side__actions">
        <Button label="Назад"></Button>
        <Button label="Сохранить"></Button>
        <Button label="Отправить"></Button>
        <Button label="Распечатать"></Button>
      </div>
      <div class="left-side__rooms">
        <Button class="p-button-success" label="Добавить комнату" />
        <Button label="Все комнаты" />
        <div class="left-side__rooms-list">
          <Button class="p-button-secondary" label="Комната" />
          <Button class="p-button-secondary" label="Кладовая" />
          <Button class="p-button-secondary" label="Комната" />
          <Button class="p-button-secondary" label="Кладовая" />
          <Button class="p-button-secondary" label="Комната" />
          <Button class="p-button-secondary" label="Кладовая" />
        </div>
        <Button class="p-button-secondary" label="Сводная" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$header-height: 55px;

.left-side {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  &__header {
    height: $header-height;
    padding: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: $color-dark;
  }

  &__body {
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
  }

  &__actions {
    background-color: $color-light;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 5px;
    padding: 10px;
  }

  &__rooms {
    background-color: $color-light;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    padding: 10px;

    &-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      overflow: auto;
      @include darkScroll;
    }

    button {
      min-height: 30px;
    }
  }
}
</style>
