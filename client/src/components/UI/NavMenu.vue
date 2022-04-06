<script>
import OpenIcon from '../UI/Icons/OpenIcon.vue'
import NavItemIcon from '../UI/Icons/NavItemIcon.vue'

export default {
  components: { OpenIcon, NavItemIcon },
  data() {
    return {
      isListVisible: false,
    }
  },
  methods: {
    toggleList() {
      this.isListVisible = !this.isListVisible
    },
  },
}
</script>

<template>
  <nav class="nav-menu">
    <div class="menu-item">
      <NavItemIcon />
      <div class="menu-item__body">
        <div class="menu-item__head" @click="toggleList">
          <span class="menu-item__title"> Архитектура сметы </span>
          <AppButton
            class="menu-item__button"
            :class="{ rotated: isListVisible }"
          >
            <OpenIcon />
          </AppButton>
        </div>
        <ul v-if="isListVisible" class="menu-item__list">
          <li class="menu-item__list-item">
            <RouterLink
              class="menu-item__list-link"
              to="/directories"
              active-class="menu-item__list-link--active"
            >
              Справочники
            </RouterLink>
          </li>
          <li class="menu-item__list-item">
            <RouterLink
              class="menu-item__list-link"
              to="/pricelists"
              active-class="menu-item__list-link--active"
            >
              Прайс лист
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.menu-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  &__body {
    flex: 1;
  }

  &__head {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  &__title {
    font-weight: 700;
    line-height: 17px;
    flex: 1;
  }

  &__button {
    transition: transform 0.3s;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    list-style-type: none;
    padding-top: 13px;
  }
  &__list-link {
    text-decoration: none;
    color: rgba($color-light, 0.6);

    &--active {
      color: $color-light;
    }
  }
}

.rotated {
  transform: rotate(180deg);
}
</style>
