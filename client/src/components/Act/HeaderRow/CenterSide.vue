<script>
import InfoCircleFill from '@/components/UI/Icons/InfoCircleFill.vue'
import OutlayList from './CenterSide/ActList.vue'
import InfoModal from './CenterSide/Modals/InfoModal.vue'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'
import { actStatus } from '../../../enum/actStatus'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    InfoCircleFill,
    OutlayList,
    InfoModal,
    OutlayBlock,
  },
  computed: {
    ...mapGetters('acts', ['acts']),
  },
  methods: {
    ...mapActions('acts', ['create']),
    showInfo() {
      this.$refs['info-modal'].show()
    },
    canCreate() {
      const lastAct = this.acts[this.acts.length - 1]
      if (!lastAct) {
        return true
      }
      const { status } = lastAct

      return status === actStatus.CONFIRMED
    },
    async createAct() {
      const canCreate = this.canCreate()
      if (!canCreate) {
        return this.$toast.add({
          severity: 'warn',
          detail: 'Предыдущий акт должен быть согласован',
          life: 3000,
        })
      }
      try {
        await this.create()
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
    <OutlayBlock class="center__outlays">
      <button class="button create" @click="createAct">
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
    background-color: $color-dark;
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
      color: #fff;
    }

    &-name {
      font-weight: 400;
      font-size: 14px;
      line-height: 17px;
    }

    &-id {
      font-weight: 400;
      font-size: 22px;
      line-height: 27px;
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
    background-color: $color-dark;
  }
}

.create {
  background: $color-success;
  border: 1px solid $color-success;
  border-radius: 10px;
  padding: 9px 15px;
  width: 41px;
  justify-content: center;

  &__icon {
    color: #fff;
  }
}
</style>
