<script>
import UserAvatar from '@/components/UI/UserAvatar.vue'
import NotificationButton from '@/components/UI/NotificationButton.vue'
import { mapGetters } from 'vuex'

export default {
  components: { NotificationButton, UserAvatar },
  computed: {
    ...mapGetters(['isOffline']),
  },
}
</script>

<template>
  <div class="right-side">
    <i
      :class="{ visible: isOffline }"
      v-tooltip.bottom="'Режим оффлайн'"
      class="pi pi-exclamation-triangle offline-icon"
    ></i>
    <NotificationButton />
    <AppButton>
      <UserAvatar />
    </AppButton>
  </div>
</template>

<style lang="scss" scoped>
.right-side {
  display: flex;
  gap: 15px;
  align-items: center;
}

.offline-icon {
  font-size: 0px;
  color: orange;
  opacity: 0;

  &.visible {
    opacity: 1;
    font-size: 20px;
  }
}
</style>
