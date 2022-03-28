<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isItemsVisible: false,
    }
  },
  methods: {
    toggle() {
      this.isItemsVisible ? this.hideItems() : this.showItems()
    },
    showItems() {
      this.isItemsVisible = true
    },
    hideItems() {
      this.isItemsVisible = false
    },
    clickHandler(handler) {
      handler()
      this.hideItems()
    },
  },
}
</script>

<template>
  <div class="app-dropdown">
    <AppButton class="app-dropdown__body" @click="toggle">
      <slot />
    </AppButton>
    <template v-if="isItemsVisible">
      <div class="app-dropdown__backdrop" @click="hideItems"></div>
      <ul ref="items" class="app-dropdown__items">
        <li
          v-for="item in items"
          :key="item.text"
          class="app-dropdown__item"
          @click="clickHandler(item.handler)"
        >
          {{ item.text }}
        </li>
      </ul>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.app-dropdown {
  position: relative;

  &__body {
    cursor: pointer;
  }

  &__items {
    position: absolute;
    background-color: $color-light;
    box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    list-style-type: none;
    display: flex;
    flex-direction: column;
    padding: 9px 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
  }

  &__item {
    cursor: pointer;
    padding: 5px 10px;
    font-weight: 400;
    line-height: 15px;
    user-select: none;
    color: #000000;

    &:hover {
      background-color: #e5e5e5;
    }
  }

  &__backdrop {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 2;
  }
}
</style>
