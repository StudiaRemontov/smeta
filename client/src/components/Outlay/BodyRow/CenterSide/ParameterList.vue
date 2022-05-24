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
    allParameters() {
      return this.calculateAllParameters(this.parameters)
    },
  },
}
</script>

<template>
  <div class="parameters">
    <span>Параметры</span>
    <div class="parameters__list">
      <div
        v-for="(val, key) in allParameters.options"
        :key="key"
        class="parameters__item"
      >
        <span v-if="roomOptions[key] !== roomOptions.spaces">
          {{ key }}: {{ val }}
        </span>
        <span v-else> {{ key }}: {{ spaces }} </span>
      </div>
      <div
        v-for="(val, key) in allParameters.computed"
        :key="key"
        class="parameters__item parameters__item--calculated"
      >
        {{ key }}: {{ val }}
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
