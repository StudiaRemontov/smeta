<script>
import RoomItem from './RoomItem.vue'
import RoomModal from './Modals/RoomModal.vue'
import Menu from 'primevue/menu'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: { RoomItem, RoomModal, Menu },
  emits: ['open-edit', 'clone'],
  data() {
    return {
      selectedItem: null,
      items: [
        {
          label: 'Редактировать',
          icon: 'pi pi-pencil',
          command: () => {
            this.setSelectedRoom(this.selectedItem)
            this.openEditModal()
          },
        },
        {
          label: 'Клонировать',
          icon: 'pi pi-clone',
          command: () => {
            this.$emit('clone', this.selectedItem.id)
          },
        },
        {
          label: 'Удалить',
          icon: 'pi pi-trash',
          command: () => {
            this.remove(this.selectedItem.id)
          },
        },
      ],
    }
  },
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
    ...mapMutations('outlay', ['setSelectedRoom']),
    ...mapActions('outlay', ['removeRoom', 'updateRoom']),
    openMenu(e, room) {
      this.selectedItem = room
      this.$refs.menu.toggle(e)
    },
    async remove(id) {
      try {
        await this.removeRoom(id)
      } catch (error) {
        console.log(error)
      }
    },
    async openEditModal() {
      const response = await this.$refs['edit-modal'].show({
        title: 'Редактировать помещение',
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
  <Menu ref="menu" :model="items" :popup="true" />
  <RoomModal ref="edit-modal" />
  <div class="room-list">
    <RoomItem
      v-for="room in roomList"
      :key="room.id"
      :room="room"
      :active="activeRoomId === room.id"
      @edit="openEditModal"
      @remove="removeRoom"
      @open-menu="openMenu"
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
