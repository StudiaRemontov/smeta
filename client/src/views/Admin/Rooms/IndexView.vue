<script>
import { mapGetters } from 'vuex'

import RoomList from '@/components/Admin/Rooms/RoomList.vue'

export default {
  components: { RoomList },
  computed: {
    ...mapGetters('roomType', ['roomTypes']),
  },
}
</script>

<template>
  <div>
    <AppButton variant="primary" :to="{ name: 'roomsAdd' }"
      >Добавить комнату</AppButton
    >
    <span v-if="!roomTypes.length"> Комнат нету </span>
    <RoomList v-else :rooms="roomTypes" />
  </div>
</template>

<style></style>
