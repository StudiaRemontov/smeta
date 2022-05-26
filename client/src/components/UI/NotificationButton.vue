<script>
import NotificationIcon from '@/components/UI/Icons/NotificationIcon.vue'

export default {
  components: { NotificationIcon },
}
</script>

<template>
  <AppButton class="notification-button">
    <NotificationIcon class="notification-button__icon" />
    <div class="notification-button__counter">35</div>
  </AppButton>
</template>

<style lang="scss" scoped>
.notification-button {
  display: flex;
  align-items: flex-start;

  &__counter {
    color: white;
    font-size: 12px;
    padding: 5px;
    line-height: 3px;
    font-weight: 700;
    border-radius: 10px;
    background-color: #de4848;
    height: 15px;
    text-align: center;
    transform: translateY(-50%);
    font-family: $base-font-family;
  }
}
</style>
