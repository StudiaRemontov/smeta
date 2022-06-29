<script>
import Button from 'primevue/button'
import RoomsIcon from '@/components/UI/Icons/RoomsIcon.vue'
import DocumentIcon from '@/components/UI/Icons/DocumentIcon.vue'
import CirclePlusIcon from '@/components/UI/Icons/CirclePlusIcon.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

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
    OutlayBlock,
  },
  computed: {
    ...mapGetters('outlay', [
      'selectedRoom',
      'showResults',
      'quantityKey',
      'invalidJobs',
    ]),
    mainTabs() {
      return [
        {
          text: 'Все помещения',
          handler: () => {
            this.setSelectedRoom(null)
          },
          icon: 'RoomsIcon',
          active: !this.selectedRoom && !this.showResults,
        },
        {
          text: 'Сводная',
          handler: () => {
            this.setShowResults(true)
          },
          icon: 'DocumentIcon',
          active: this.showResults,
        },
      ]
    },
    invalidNodes() {
      const values = Object.values(this.invalidJobs)
      return values.some(v => v.length > 0)
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSelectedRoom', 'setShowResults']),
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
        const { response } = error
        const message = response ? response.data.message : error.message
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        })
      }
    },
  },
}
</script>

<template>
  <RoomModal ref="room-modal" />
  <OutlayBlock class="tab-list">
    <div class="rooms">
      <button
        class="button create"
        :disabled="invalidNodes"
        @click="openCreateModal"
      >
        <CirclePlusIcon />
        Помещение
      </button>
      <RoomList @clone="clone" />
    </div>
    <div class="main-tabs">
      <button
        v-for="tab in mainTabs"
        :key="tab.text"
        class="button main-tab"
        :class="{ active: tab.active }"
        :disabled="invalidNodes"
        @click="tab.handler"
      >
        <component class="main-tab__icon" :is="tab.icon" />
        <span class="main-tab__text">
          {{ tab.text }}
        </span>
      </button>
    </div>
  </OutlayBlock>
</template>

<style lang="scss" scoped>
.tab-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 25px 13px;
  min-height: 0px;
  gap: 25px;
}

.main-tabs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 25px 12px;
  padding-bottom: 0;
  border-top: 1px solid #a7a7a7;
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

  &:disabled {
    opacity: 0.5;
  }

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
  flex: 1;
  gap: 25px;
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

  &:disabled {
    opacity: 0.5;
  }
}
</style>
