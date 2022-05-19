<script>
import NotificationButton from '@/components/UI/NotificationButton.vue'
import UserAvatar from '@/components/UI/UserAvatar.vue'

export default {
  components: {
    NotificationButton,
    UserAvatar,
  },
}
</script>
<template>
  <div class="right-side">
    <NotificationButton />
    <AppButton>
      <UserAvatar />
    </AppButton>
  </div>
</template>

<style lang="scss" scoped>
.right-side {
  width: 270px;
  padding: 10px;
  padding-right: 30px;
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: flex-end;
  background-color: $color-dark;
  border-radius: 0px 0px 0px 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
