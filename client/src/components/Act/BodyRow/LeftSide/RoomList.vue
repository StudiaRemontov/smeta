<script>
import RoomItem from './RoomItem.vue'

import { mapGetters } from 'vuex'

export default {
  components: { RoomItem },
  emits: ['open-edit', 'clone'],
  computed: {
    ...mapGetters('acts', ['activeRoom']),
    ...mapGetters('outlay', ['outlay']),
    rooms() {
      return [...this.outlay.rooms].reverse()
    },
    activeRoomId() {
      return this.activeRoom?.id
    },
  },
}
</script>

<template>
  <div class="room-list">
    <RoomItem
      v-for="room in rooms"
      :key="room.id"
      :room="room"
      :active="activeRoomId === room.id"
    />
  </div>
</template>

<style lang="scss" scoped>
.room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 40px;
  padding: 0px 12px;
  max-width: 100%;
  width: 100%;
  @include darkScroll;
}
</style>
