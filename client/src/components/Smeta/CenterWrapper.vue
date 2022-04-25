<script>
import Button from 'primevue/button'
import AutoComplete from 'primevue/autocomplete'
import InputSwitch from 'primevue/inputswitch'

import TreeTable from './Center/TreeTable.vue'

export default {
  components: {
    Button,
    AutoComplete,
    InputSwitch,
    TreeTable,
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
      <TreeTable />
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
</style>
