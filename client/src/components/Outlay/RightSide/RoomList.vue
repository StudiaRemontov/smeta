<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RoomList',
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', ['roomsData']),
  },
}
</script>
<template>
  <div class="room-list">
    <div v-for="room in rooms" :key="room.id" class="right-side__room">
      <div class="room__head">
        <span class="room__name"> {{ room.name }} </span>
        <span class="room__price room__price--bold">
          {{ room.sum.toLocaleString() }}
        </span>
      </div>
      <div v-if="room.jobs" class="room-list">
        <div v-for="job in room.jobs" :key="job.key" class="right-side__room">
          <div class="room__head">
            <span class="room__name"> {{ job.name }} </span>
            <span class="room__price"> {{ job.sum.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 10px;
}

.room {
  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  &__price--bold {
    font-weight: 600;
  }
}
</style>
