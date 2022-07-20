<script>
import Button from 'primevue/button'

import InputNumber from './InputNumber.vue'

export default {
  components: {
    Button,
    InputNumber,
  },
  inject: ['removeItem', 'updateItem', 'type', 'label'],
  props: {
    item: {
      type: Object,
      required: true,
      default: () => {
        return {}
      },
    },
    index: Number,
  },
  computed: {
    width: {
      get() {
        return this.item.width
      },
      set(value) {
        this.updateItem(this.type, this.item.id, 'width', value)
      },
    },
    height: {
      get() {
        return this.item.height
      },
      set(value) {
        this.updateItem(this.type, this.item.id, 'height', value)
      },
    },
  },
  methods: {
    removeItemHandler() {
      this.removeItem(this.type, this.item.id)
    },
  },
}
</script>

<template>
  <li class="list-item">
    <div class="list-item__left-side">
      <span class="list-item__name"> {{ label }} №{{ index + 1 }} </span>
      <ul class="list-item__params">
        <li class="list-item__param">
          <label>Высота: </label>
          <InputNumber
            v-model="height"
            class="list-item__input"
            placeholder="Введите значение"
          />
        </li>
        <li class="list-item__param">
          <label>Ширина: </label>
          <InputNumber
            v-model="width"
            class="list-item__input"
            placeholder="Введите значение"
          />
        </li>
      </ul>
    </div>
    <div class="list-item__actions">
      <Button
        v-tooltip.top="'Удалить'"
        icon="pi pi-trash"
        class="p-button-danger"
        @click="removeItemHandler"
      />
    </div>
  </li>
</template>

<style lang="scss" scoped>
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px #ccc solid;
  padding: 10px;

  &__left-side {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
  }

  &__name {
    font-weight: 600;
  }

  &__params {
    display: flex;
    flex-direction: column;
    gap: 5px;
    list-style-type: none;
  }

  &__param {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  &__input {
    max-width: 100%;
    width: 100%;
    padding: 0px;
    border: none;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }
}
</style>
