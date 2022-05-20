<script>
import AppLogo from '@/components/UI/AppLogo.vue'

export default {
  components: { AppLogo },
}
</script>

<template>
  <div class="left-side">
    <AppLogo />
  </div>
</template>

<style lang="scss" scoped>
.left-side {
  padding: 10px;
  width: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-dark;
  border-radius: 0px 0px 10px 0px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
