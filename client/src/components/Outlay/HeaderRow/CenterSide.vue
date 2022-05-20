<script>
import InfoCircleFill from '@/components/UI/Icons/InfoCircleFill.vue'
import OutlayList from '../HeaderRow/CenterSide/OutlayList.vue'
import InfoModal from './CenterSide/Modals/InfoModal.vue'
import CreateModal from './CenterSide/Modals/CreateModal.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    InfoCircleFill,
    OutlayList,
    InfoModal,
    CreateModal,
  },
  methods: {
    ...mapActions('outlays', ['create']),
    showInfo() {
      this.$refs['info-modal'].show()
    },
    async createOutlay() {
      const response = await this.$refs['create-modal'].show({
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (response) {
        try {
          await this.create(response)
        } catch (error) {
          console.log(error)
        }
      }
    },
  },
}
</script>
<template>
  <CreateModal ref="create-modal" />
  <InfoModal ref="info-modal" />
  <div class="center">
    <div class="center__info">
      <div class="center__info-wrapper">
        <span class="center__info-id"> 423423432 </span>
        <button class="button" @click="showInfo">
          <InfoCircleFill />
        </button>
      </div>
    </div>
    <div class="center__outlays">
      <button class="button create" @click="createOutlay">
        <i class="pi pi-plus create__icon" />
      </button>
      <OutlayList />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.center {
  display: flex;
  gap: 10px;
  padding: 0 15px;
  overflow: auto;

  &__info {
    background-color: $color-light;
    border-radius: 0px 0px 10px 10px;
    display: flex;
    align-content: center;
    justify-content: center;
    max-width: 212px;
    width: 100%;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);

    &-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow: hidden;
      padding: 0 20px;
    }

    &-id {
      font-weight: 400;
      font-size: 25px;
      line-height: 30px;
      color: #000000;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  &__outlays {
    background-color: $color-light;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    border-radius: 0px 0px 10px 10px;
    padding: 10px 15px;
    flex: 1;
    display: flex;
    gap: 15px;
    overflow: auto;
  }
}

.create {
  background: #28c430;
  border: 1px solid #28c430;
  border-radius: 10px;
  padding: 9px 15px;
  width: 41px;
  justify-content: center;

  &__icon {
    color: #fff;
  }
}
</style>
