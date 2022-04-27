<script>
import AppLogo from '@/components/UI/AppLogo.vue'
import Button from 'primevue/button'
import RoomList from './LeftSide/RoomList.vue'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: { AppLogo, Button, RoomList },
  computed: {
    ...mapGetters('outlay', ['room']),
  },
  methods: {
    ...mapMutations('outlay', ['createRoom', 'selectRoom']),
    back() {},
    save() {},
    send() {},
    print() {},
    showAllRooms() {
      this.selectRoom(null)
    },
    showSummary() {},
  },
}
</script>

<template>
  <div class="left-side">
    <div class="left-side__header">
      <AppLogo />
    </div>
    <div class="left-side__body">
      <div class="left-side__actions">
        <Button @click="back">
          <i class="pi pi-replay"></i>
          <span>Назад</span>
        </Button>
        <Button @click="save">
          <i class="pi pi-save"></i>
          <span>Сохранить</span>
        </Button>
        <Button @click="send">
          <i class="pi pi-send"></i>
          <span>Отправить</span>
        </Button>
        <Button @click="print">
          <i class="pi pi-print"></i>
          <span>Распечатать</span>
        </Button>
      </div>
      <div class="left-side__rooms">
        <Button
          label="Все комнаты"
          class="button"
          :class="{ 'p-button-secondary': room }"
          @click="showAllRooms"
        />
        <RoomList />
        <Button
          class="p-button-secondary button"
          label="Сводная"
          @click="showSummary"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$header-height: 55px;

.left-side {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;

  &__header {
    height: $header-height;
    padding: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: $color-dark;
  }

  &__body {
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 0;
  }

  &__actions {
    background-color: $color-light;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-radius: 5px;
    padding: 20px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
  }

  &__rooms {
    background-color: $color-light;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    padding: 20px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
  }
}

::v-deep(.p-button) {
  gap: 5px;
  text-align: left;
  background-color: #00afec;
  font-weight: 600;
  color: #fff;
  height: 40px;

  &:enabled:hover {
    background-color: #00afec;
  }
}
</style>
