<script>
import { mapGetters } from 'vuex'
import { roomOptions } from '@/enum/roomOptions'
import mathExp from 'math-expression-evaluator'

export default {
  computed: {
    ...mapGetters('outlay', ['selectedRoom']),
    parameters() {
      if (!this.selectedRoom) return {}
      return this.selectedRoom.options
    },
    roomOptionsLabels() {
      return roomOptions
    },
    calculatedParameters() {
      if (Object.keys(this.parameters).length === 0) return {}
      const perimeter = (this.parameters.width + this.parameters.length) * 2
      const spaces = this.mathEval(this.parameters.spaces)
      return {
        perimeter,
        floorArea: this.parameters.width * this.parameters.length,
        wallArea: perimeter * this.parameters.height - spaces,
      }
    },
  },
  methods: {
    mathEval(value) {
      try {
        return mathExp.eval(value)
      } catch (error) {
        return 0
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
        <span v-if="roomOptionsLabels[key] !== roomOptionsLabels.spaces">
          {{ roomOptionsLabels[key] }}: {{ val }}
        </span>
        <span v-else> {{ roomOptionsLabels[key] }}: {{ mathEval(val) }} </span>
      </div>
      <div
        v-for="(val, key) in calculatedParameters"
        :key="key"
        class="parameters__item parameters__item--calculated"
      >
        {{ roomOptionsLabels[key] }}: {{ val }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.parameters {
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
  background-color: $color-light;
  padding: 20px;

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
