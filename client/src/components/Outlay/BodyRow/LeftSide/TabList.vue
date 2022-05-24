<script>
import Button from 'primevue/button'
import RoomsIcon from '@/components/UI/Icons/RoomsIcon.vue'
import DocumentIcon from '@/components/UI/Icons/DocumentIcon.vue'
import CirclePlusIcon from '@/components/UI/Icons/CirclePlusIcon.vue'

import RoomModal from './Modals/RoomModal.vue'
import RoomList from './RoomList.vue'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    RoomsIcon,
    DocumentIcon,
    RoomList,
    Button,
    CirclePlusIcon,
    RoomModal,
  },
  computed: {
    ...mapGetters('outlay', ['selectedRoom']),
    mainTabs() {
      return [
        {
          text: 'Все помещения',
          handler: () => {
            this.setSelectedRoom(null)
          },
          icon: 'RoomsIcon',
          active: !this.selectedRoom,
        },
        {
          text: 'Сводная',
          handler() {
            console.log(1)
          },
          icon: 'DocumentIcon',
          active: false,
        },
      ]
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSelectedRoom']),
    ...mapActions('outlay', ['createRoom', 'cloneRoom']),
    async openCreateModal() {
      const response = await this.$refs['room-modal'].show({
        title: 'Создать помещение',
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (!response) {
        return
      }
      this.createRoom(response)
    },
    async clone(cloningRoomId) {
      const response = await this.$refs['room-modal'].show({
        title: 'Клонировать помещение',
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (!response) {
        return
      }
      try {
        await this.cloneRoom({ ...response, cloningRoomId })
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <RoomModal ref="room-modal" />
  <div class="tab-list">
    <div class="main-tabs">
      <button
        v-for="tab in mainTabs"
        :key="tab.text"
        class="button main-tab"
        :class="{ active: tab.active }"
        @click="tab.handler"
      >
        <component class="main-tab__icon" :is="tab.icon" />
        <span class="main-tab__text">
          {{ tab.text }}
        </span>
      </button>
    </div>
    <div class="rooms">
      <button class="button create" @click="openCreateModal">
        <CirclePlusIcon />
        Помещение
      </button>
      <RoomList @clone="clone" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: $color-light;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 27px 13px;
  min-height: 0px;
}

.main-tabs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 12px 14px;
  border-bottom: 1px solid #a7a7a7;
}

.main-tab {
  background: $color-light;
  border: 1px solid #00afec;
  border-radius: 10px;
  padding: 10px 15px;
  color: #00afec;
  display: flex;
  align-items: center;
  gap: 13px;

  &.active {
    background-color: #00afec;
    color: $color-light;
  }

  &__icon {
    width: 13px;
    height: 13px;
  }
}

.rooms {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0px;
}

.create {
  background: #28c430;
  border: 1px solid #28c430;
  border-radius: 10px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: $color-light;
  margin: 15px 0;
}
</style>
