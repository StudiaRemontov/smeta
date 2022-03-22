<script>
export default {
  data() {
    return {
      links: [
        {
          text: 'Команты',
          to: 'rooms',
        },
        {
          text: 'Подкатегории',
          to: 'subcategories',
        },
        {
          text: 'Категории',
          to: 'categories',
        },
      ],
    }
  },
}
</script>

<template>
  <nav class="nav-menu">
    <RouterLink
      v-for="link in links"
      class="nav-menu__link"
      active-class="nav-menu__link--active"
      :key="link.to"
      :to="`/admin/${link.to}`"
    >
      {{ link.text }}
    </RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
.nav-menu {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  &__link {
    text-decoration: none;
    color: #000;

    &:hover {
      text-decoration: underline;
    }

    &--active {
      color: $color-primary;
    }
  }
}
</style>
