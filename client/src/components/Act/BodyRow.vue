<script>
import CenterSide from './BodyRow/CenterSide.vue'
import RightSide from './BodyRow/RightSide.vue'
import LeftSide from './BodyRow/LeftSide.vue'
import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    LeftSide,
    CenterSide,
    RightSide,
  },
  computed: {
    ...mapGetters('acts', ['maximized']),
  },
  mounted() {
    document.addEventListener('keydown', this.onKeyDown)
  },
  unmounted() {
    document.removeEventListener('keydown', this.onKeyDown)
  },
  methods: {
    ...mapMutations('acts', ['setMaximized']),
    onKeyDown(e) {
      const { ctrlKey, keyCode } = e
      if (ctrlKey && keyCode === 66) {
        this.setMaximized(!this.maximized)
      }
    },
  },
}
</script>

<template>
  <div class="body-row" :class="{ maximized }">
    <div class="left-side">
      <LeftSide />
    </div>
    <CenterSide />
    <div class="right-side">
      <RightSide />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body-row {
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  padding-bottom: 17px;
  min-height: 0px;

  &.maximized {
    .left-side,
    .right-side {
      width: 50px;
    }
  }
}

.left-side,
.right-side {
  width: 270px;
  padding: 0px 15px;
  display: flex;
  min-height: 0px;
  transition: all 0.2s ease-in-out;
}

.center {
  background-color: $color-light;
  border-radius: 10px;

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0px;
  }
}
</style>
