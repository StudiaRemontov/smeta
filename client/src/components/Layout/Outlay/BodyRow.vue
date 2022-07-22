<script>
import { mapMutations } from 'vuex'
export default {
  props: {
    showLeftSide: Boolean,
    showRightSide: Boolean,
  },
  mounted() {
    document.addEventListener('keydown', this.onKeyDown)
  },
  unmounted() {
    document.removeEventListener('keydown', this.onKeyDown)
  },
  methods: {
    ...mapMutations('outlay', ['toggleSides']),
    onKeyDown(e) {
      const { ctrlKey, keyCode } = e
      if (ctrlKey && keyCode === 66) {
        this.toggleSides()
      }
    },
  },
}
</script>

<template>
  <div class="body-row">
    <div class="left-side" :class="{ hidden: !showLeftSide }">
      <slot name="left-side" />
    </div>
    <slot name="center" />
    <div class="right-side" :class="{ hidden: !showRightSide }">
      <slot name="right-side" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body-row {
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  gap: 10px;
  padding-bottom: 17px;
  min-height: 0px;
  padding: 0px 10px 10px;
}

.left-side,
.right-side {
  width: 270px;
  display: flex;
  min-height: 0px;
  transition: all 0.2s ease-in-out;
  position: relative;

  &.hidden {
    width: 50px;

    .wrapper {
      overflow: hidden;
    }
  }
}
</style>
