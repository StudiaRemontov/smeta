<script>
export default {
  data() {
    return {
      links: [
        {
          text: 'Админ панель',
          to: '/admin',
        },
      ],
    }
  },
}
</script>

<template>
  <header class="header">
    <nav class="links">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to">
        {{ link.text }}
      </RouterLink>
    </nav>
  </header>
</template>
