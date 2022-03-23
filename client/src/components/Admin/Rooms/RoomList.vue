<script>
import RoomItem from './RoomItem.vue'

export default {
  components: { RoomItem },
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <ul class="room-list">
    <RoomItem v-for="room in rooms" :key="room._id" :room="room" />
  </ul>
</template>

<style lang="scss" scoped>
.room-list {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}
</style>
