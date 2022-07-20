<template>
  <div class="info-block">
    <div class="info-block__section base-section">
      <div class="info-block__section-title">Общая информация</div>
      <ul class="base-section__list">
        <li class="base-section__item">
          <span class="base-section__item-key"> Мастер: </span>
          <span class="base-section__item-value"> Иванов В.П. </span>
        </li>
        <li class="base-section__item">
          <span class="base-section__item-key"> Срок: </span>
          <span class="base-section__item-value"> 100 дней </span>
        </li>
        <li class="base-section__item">
          <span class="base-section__item-key"> Отставание от графика: </span>
          <span class="base-section__item-value"> 1 день </span>
        </li>
      </ul>
    </div>
    <div class="info-block__section income-section">
      <div class="info-block__section-title">Выручка</div>
    </div>

    <div class="info-block__section outcome-section">
      <div class="info-block__section-title">Долги</div>
    </div>

    <div class="info-block__section problems-section">
      <div class="info-block__section-title">Проблемы ОТК</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.info-block {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__section {
    border-bottom: 1px #ccc solid;
    padding-bottom: 10px;

    &-title {
      text-align: center;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.base-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
  &__list {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__item {
    &-value {
      font-weight: 600;
    }
  }
}
</style>
