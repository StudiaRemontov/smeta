<script>
import InfoCircleFill from '@/components/UI/Icons/InfoCircleFill.vue'
import InfoModal from './CenterSide/Modals/InfoModal.vue'
import OutlayBlock from '@/components/Layout/Outlay/OutlayBlock.vue'

export default {
  components: {
    InfoCircleFill,
    InfoModal,
    OutlayBlock,
  },
  inject: ['objectData'],

  methods: {
    showInfo() {
      this.$refs['info-modal'].show()
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
          <span class="center__info-id"> {{ objectData.id }} </span>
          <span class="center__info-name">{{ objectData.user }}</span>
        </div>
        <button class="button" @click="showInfo">
          <InfoCircleFill class="info-icon" />
        </button>
      </div>
    </OutlayBlock>
    <OutlayBlock class="center__outlays">
      <slot />
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

    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}

.info-icon {
  color: #fff;
}
</style>
