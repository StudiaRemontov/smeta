<script>
import { computed } from 'vue'
import Button from 'primevue/button'

import ListItem from './ListItem.vue'

export default {
  components: {
    Button,
    ListItem,
  },
  provide() {
    return {
      type: computed(() => this.type),
      label: computed(() => this.label),
    }
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
      default: () => {
        return []
      },
    },
    type: {
      required: true,
    },
  },
  emits: ['createItem', 'clear'],
}
</script>

<template>
  <div class="list-items">
    <span class="list-items__label">
      {{ title }}
    </span>
    <div class="list-items__actions">
      <Button
        v-tooltip.top="'Добавить'"
        class="list-item__create p-button-success"
        icon="pi pi-plus"
        @click="$emit('createItem')"
      />
      <Button
        v-tooltip.top="'Отчистить'"
        class="list-item__create p-button-danger"
        icon="pi pi-times-circle"
        @click="$emit('clear')"
      />
    </div>
    <ul v-if="items && items.length > 0" class="list-items__list">
      <ListItem
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :index="index"
      />
    </ul>
    <div v-else class="list-items__empty">Пусто</div>
  </div>
</template>

<style lang="scss" scoped>
.list-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px #ccc solid;

  &__label {
    font-weight: 600;
    text-align: center;
    font-size: 16px;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 5px;
  }

  &__list {
    overflow: auto;
    @include darkScroll;
  }

  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
}
</style>
