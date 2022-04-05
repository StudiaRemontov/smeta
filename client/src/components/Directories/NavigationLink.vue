<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    delimeter: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <RouterLink class="link" :to="url"> {{ text }} </RouterLink>
  <span v-if="delimeter" class="link__delimeter">/</span>
</template>

<style lang="scss" scoped>
.link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  color: #000;
  font-size: $font-high;
  padding: 5px;
  border-radius: 10px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgb(199, 199, 199);
  }

  &__delimeter {
    font-weight: 700;
  }
}
</style>
