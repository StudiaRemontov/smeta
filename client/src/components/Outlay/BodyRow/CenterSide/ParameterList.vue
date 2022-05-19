<script>
import { mapGetters } from 'vuex'

import roomParameters from '@/mixins/roomParameters.mixin'

export default {
  mixins: [roomParameters],
  computed: {
    ...mapGetters('outlay', ['selectedRoom']),
    parameters() {
      if (!this.selectedRoom) return {}
      return this.selectedRoom.options
    },
    spaces() {
      return this.getSpaces(this.parameters.spaces)
    },
    perimeter() {
      return this.getPerimeter(this.parameters.width, this.parameters.length)
    },
    floorArea() {
      return this.getFloorArea(this.parameters.width, this.parameters.length)
    },
    wallArea() {
      return this.getWallArea(
        this.perimeter,
        this.parameters.height,
        this.spaces,
      )
    },
    calculatedParameters() {
      if (Object.keys(this.parameters).length === 0) return {}
      return {
        perimeter: this.perimeter,
        floorArea: this.floorArea,
        wallArea: this.wallArea,
      }
    },
  },
}
</script>

<template>
  <div class="parameters">
    <span>Параметры</span>
    <div class="parameters__list">
      <div v-for="(val, key) in parameters" :key="key" class="parameters__item">
        <span v-if="roomOptions[key] !== roomOptions.spaces">
          {{ roomOptions[key] }}: {{ val }}
        </span>
        <span v-else> {{ roomOptions[key] }}: {{ spaces }} </span>
      </div>
      <div
        v-for="(val, key) in calculatedParameters"
        :key="key"
        class="parameters__item parameters__item--calculated"
      >
        {{ roomOptions[key] }}: {{ val }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.parameters {
  padding: 20px;
  border-bottom: 1px solid #a7a7a7;

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  &__item {
    border: 1px solid #a7a7a7;
    padding: 10px;
    border-radius: 5px;

    &--calculated {
      color: rgb(238, 156, 4);
      border-color: rgb(238, 156, 4);
    }
  }
}
</style>
