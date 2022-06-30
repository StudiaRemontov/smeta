<script>
import InfoCircleFill from '@/components/UI/Icons/InfoCircleFill.vue'
import OutlayList from '../HeaderRow/CenterSide/OutlayList.vue'
import InfoModal from './CenterSide/Modals/InfoModal.vue'
import CreateModal from './CenterSide/Modals/CreateModal.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    InfoCircleFill,
    OutlayList,
    InfoModal,
    CreateModal,
    OutlayBlock,
  },
  computed: {
    ...mapGetters('outlay', ['invalidJobs']),
    invalidNodes() {
      const values = Object.values(this.invalidJobs)
      return values.some(v => v.length > 0)
    },
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
          const { response } = error
          const message = response ? response.data.message : error.message
          this.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: message,
            life: 3000,
          })
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
    <OutlayBlock class="center__info">
      <div class="center__info-wrapper">
        <div class="center__info-text">
          <span class="center__info-id"> 12345 </span>
          <span class="center__info-name">Сергей Алексеевич</span>
        </div>
        <button class="button" @click="showInfo">
          <InfoCircleFill />
        </button>
      </div>
    </OutlayBlock>
    <OutlayBlock class="center__outlays" :class="{ disabled: invalidNodes }">
      <button
        class="button create"
        :disabled="invalidNodes"
        @click="createOutlay"
      >
        <i class="pi pi-plus create__icon" />
      </button>
      <OutlayList />
    </OutlayBlock>
  </div>
</template>

<style lang="scss" scoped>
.center {
  display: flex;
  gap: 10px;
  padding: 0 10px;
  overflow: auto;

  &__info {
    background-color: $color-light;
    border-radius: 0px 0px 10px 10px;
    max-width: 212px;
    width: 100%;
    padding: 5px;

    &-wrapper {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 4px;
      overflow: hidden;
    }

    &-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    &-name {
      font-weight: 400;
      font-size: 14px;
      color: #000;
      line-height: 17px;
    }

    &-id {
      font-weight: 400;
      font-size: 22px;
      line-height: 27px;
      color: #000000;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  &__outlays {
    border-radius: 0px 0px 10px 10px;
    padding: 10px 15px;
    flex: 1;
    display: flex;
    gap: 15px;
    overflow: auto;

    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
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
