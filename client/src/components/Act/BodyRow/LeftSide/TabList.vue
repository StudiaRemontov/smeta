<script>
import Button from 'primevue/button'
import RoomsIcon from '@/components/UI/Icons/RoomsIcon.vue'
import DocumentIcon from '@/components/UI/Icons/DocumentIcon.vue'
import CirclePlusIcon from '@/components/UI/Icons/CirclePlusIcon.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

import RoomList from './RoomList.vue'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    RoomsIcon,
    DocumentIcon,
    RoomList,
    Button,
    CirclePlusIcon,
    OutlayBlock,
  },
  computed: {
    ...mapGetters('acts', ['activeTab']),
    mainTabs() {
      return [
        {
          text: 'Выполненные работы',
          handler: () => {
            this.setActiveTab('completed')
          },
          icon: 'RoomsIcon',
          active: this.activeTab === 'completed',
        },
        {
          text: 'Сводная по актам',
          handler: () => {
            this.setActiveTab('acts')
          },
          icon: 'DocumentIcon',
          active: this.activeTab === 'acts',
        },
        {
          text: 'Сводная редакции 2',
          handler: () => {
            this.setActiveTab('results')
          },
          icon: 'DocumentIcon',
          active: this.activeTab === 'results',
        },
      ]
    },
  },
  methods: {
    ...mapMutations('acts', ['setActiveTab']),
  },
}
</script>

<template>
  <OutlayBlock class="tab-list">
    <div class="rooms">
      <RoomList />
    </div>
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
  text-align: left;
  white-space: nowrap;

  &.active {
    background-color: #00afec;
    color: $color-light;
  }

  &__text {
    font-size: 12px;
  }

  &__icon {
    min-width: 13px;
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
</style>
