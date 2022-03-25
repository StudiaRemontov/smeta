<script>
import EditForm from '@/components/Admin/Rooms/Edit/EditForm.vue'
import { mapGetters } from 'vuex'

export default {
  components: { EditForm },
  computed: {
    ...mapGetters('roomType', ['roomTypes']),
    id() {
      return this.$route.params?.id
    },
    room() {
      return this.roomTypes.find(c => c._id === this.id)
    },
  },
}
</script>

<template>
  <span class="subpage-title">Редактировать комнату</span>
  <span v-if="!room">Комната не найдена</span>
  <EditForm v-else :room="room" />
</template>
