<script>
import Button from 'primevue/button'
import ContextMenu from 'primevue/contextmenu'
import RoomModal from './Modals/RoomModal.vue'
import RoomItem from './RoomItem.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: { Button, ContextMenu, RoomModal, RoomItem },
  data() {
    return {
      items: [
        {
          label: 'Редактировать',
          icon: 'pi pi-pencil',
          command: () => {
            this.openEditModal()
          },
        },
        {
          label: 'Удалить',
          icon: 'pi pi-trash',
          command: () => {
            this.removeRoom()
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay', 'selectedRoom', 'rooms']),
    activeRoomId() {
      return this.selectedRoom?.id
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSelectedRoom', 'updateRoom']),
    ...mapActions('outlay', ['createRoom', 'removeRoom']),
    openContextMenu(e, id) {
      this.selectRoom({ id })
      this.$refs.menu.show(e)
    },
    async openEditModal() {
      this.$refs.menu.hide()
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
    async openCreateRoom() {
      const response = await this.$refs['room-modal'].show({
        title: 'Создать комнату',
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (!response) {
        return
      }
      this.createRoom(response)
    },
  },
}
</script>

<template>
  <RoomModal ref="room-modal" />
  <RoomModal ref="edit-modal" />
  <ContextMenu ref="menu" :model="items" />
  <div class="room-list">
    <Button
      class="p-button-success create"
      icon="pi pi-plus"
      @click="openCreateRoom"
    />
    <RoomItem
      v-for="room in rooms"
      :key="room.id"
      :room="room"
      :active="activeRoomId === room.id"
      @click="setSelectedRoom(room)"
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
