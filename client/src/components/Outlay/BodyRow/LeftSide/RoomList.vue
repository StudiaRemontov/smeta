<script>
import RoomItem from './RoomItem.vue'
import RoomModal from './Modals/RoomModal.vue'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: { RoomItem, RoomModal },
  emits: ['open-edit'],
  computed: {
    ...mapGetters('outlay', ['outlay', 'selectedRoom', 'rooms']),
    roomList() {
      return [...this.rooms].reverse()
    },
    activeRoomId() {
      return this.selectedRoom?.id
    },
  },
  methods: {
    ...mapMutations('outlay', ['updateRoom']),
    ...mapActions('outlay', ['removeRoom']),
    async remove(id) {
      try {
        await this.removeRoom(id)
      } catch (error) {
        console.log(error)
      }
    },
    async openEditModal() {
      const response = await this.$refs['edit-modal'].show({
        title: 'Редактировать комнату',
        okButton: 'Сохранить',
        cancelButton: 'Отмена',
        edit: true,
      })
      if (!response) {
        return
      }
      this.updateRoom(response)
    },
  },
}
</script>

<template>
  <RoomModal ref="edit-modal" />
  <div class="room-list">
    <RoomItem
      v-for="room in roomList"
      :key="room.id"
      :room="room"
      :active="activeRoomId === room.id"
      @edit="openEditModal"
      @remove="removeRoom"
    />
  </div>
</template>

<style lang="scss" scoped>
.room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow: auto;
  min-height: 40px;
  padding: 0px 12px;
  max-width: 100%;
  width: 100%;
  @include darkScroll;

  button {
    min-height: 30px;
    text-align: left;
  }
}

.menu-item {
  cursor: pointer;
}
::v-deep(.p-button.create) {
  .p-button-label {
    display: none;
  }
  width: 40%;
  height: 30px;
  align-self: center;
}
</style>
