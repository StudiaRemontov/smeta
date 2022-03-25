<script>
import BurgerIcon from '@/components/UI/Icons/BurgerIcon.vue'
import UserAvatar from '@/components/UI/UserAvatar.vue'
import NotificationButton from '@/components/UI/NotificationButton.vue'

export default {
  components: { BurgerIcon, NotificationButton, UserAvatar },
}
</script>

<template>
  <div class="app-header">
    <div class="app-header__left-side">
      <AppButton>
        <BurgerIcon />
      </AppButton>
    </div>

    <div class="app-header__right-side">
      <NotificationButton />
      <AppButton>
        <UserAvatar />
      </AppButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  background-color: $color-dark;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px 0 18px;
  border-left: 1px solid #000000;

  &__right-side {
    display: flex;
    gap: 15px;
    align-items: center;
  }
}
</style>
