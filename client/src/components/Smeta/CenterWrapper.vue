<script>
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'
import InputSwitch from 'primevue/inputswitch'

export default {
  components: {
    Button,
    AutoComplete,
    InputSwitch,
  },
  data() {
    return {
      screenHeight: null,
      switchValue: false,
    }
  },
  computed: {
    scrollHeight() {
      return `${this.screenHeight - 200}px`
    },
  },
  mounted() {
    this.windowResize()
    window.addEventListener('resize', this.windowResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.windowResize)
  },
  methods: {
    windowResize() {
      this.screenHeight = window.innerHeight
    },
  },
}
</script>

<template>
  <div class="center">
    <div class="center__header">
      <Button icon="pi pi-question-circle" class="p-button-warning" />
      <div class="smetaList">
        <div class="smeta">
          <span class="smeta__name"> Name 1 </span>
        </div>
        <div class="smeta">
          <span class="smeta__name"> Name 2 </span>
        </div>
        <div class="smeta">
          <span class="smeta__name"> Name 3 </span>
        </div>
      </div>
    </div>
    <div class="center__body">
      <div class="parameters">
        <span>Параметры</span>
        <div class="parameters__list">
          <div class="parameters__item">Длина: 3</div>
          <div class="parameters__item">Длина: 3</div>
          <div class="parameters__item">Длина: 3</div>
          <div class="parameters__item">Длина: 3</div>
          <div class="parameters__item">Длина: 3</div>
          <div class="parameters__item">Длина: 3</div>
          <div class="parameters__item">Длина: 3</div>
        </div>
      </div>
      <div class="body-actions">
        <AutoComplete :scrollHeight="scrollHeight" placeholder="Поиск" />
        <div class="switch">
          <InputSwitch v-model="switchValue" />
          <span>Вид новый/старый</span>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <col width="60%" />
          <tr class="table__row table__row--sticky">
            <th class="table__cell">Демонтажные работы</th>
            <th class="table__cell">Ед.изм</th>
            <th class="table__cell">Цена</th>
          </tr>
          <tr class="table__row table__row--sticky" style="top: 32px">
            <th class="table__cell table__cell--children" colspan="3">Полы</th>
          </tr>
          <tr class="table__row table__row--sticky" style="top: 64px">
            <th class="table__cell table__cell--children" colspan="3">
              Полы 1
            </th>
          </tr>
          <tr v-for="n in 10" class="table__row">
            <td class="table__cell">Демонтаж плинтуса</td>
            <td class="table__cell">Демонтаж плинтуса</td>
            <td class="table__cell">Демонтаж плинтуса</td>
          </tr>
          <tr class="table__row table__row--sticky" style="top: 32px">
            <th class="table__cell table__cell--children" colspan="3">Стены</th>
          </tr>
          <tr class="table__row table__row--sticky" style="top: 64px">
            <th class="table__cell table__cell--children" colspan="3">
              Стены 1
            </th>
          </tr>
          <tr v-for="n in 10" class="table__row">
            <td class="table__cell">Демонтаж плинтуса</td>
            <td class="table__cell">Демонтаж плинтуса</td>
            <td class="table__cell">Демонтаж плинтуса</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$header-height: 55px;

.center {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: $color-light;
  padding: 10px;
  min-height: 0px;

  &__header {
    display: flex;
    gap: 10px;
    padding-bottom: 20px;
    height: $header-height;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0px;
  }
}

.smetaList {
  display: flex;
  gap: 20px;
}

.smeta {
  border: 1px solid #a7a7a7;
  padding: 10px;
}

.body-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.parameters {
  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__item {
    border: 1px solid #a7a7a7;
    padding: 10px;
    border-radius: 5px;
  }
}

.switch {
  display: flex;
  align-items: center;
  gap: 5px;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  @include darkScroll;
}

.table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;

  &__row {
    &--sticky {
      position: sticky;
      top: 0;
      background-color: rgb(0, 160, 245);
    }
  }

  &__row--sticky &__cell {
    background-color: transparent;
    color: $color-light;
  }

  &__cell {
    padding: 8px;
    background-color: $color-light;

    &--children {
      text-align: left;
    }
  }
}
</style>
