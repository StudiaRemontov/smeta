<script>
import LeftSide from './HeaderRow/LeftSide.vue'
import CenterSide from './HeaderRow/CenterSide.vue'
import RightSide from '../App/Header/RightSide.vue'
import { mapMutations } from 'vuex'

export default {
  components: {
    LeftSide,
    CenterSide,
    RightSide,
  },
  methods: {
    ...mapMutations('outlay', ['toggleSides']),
  },
}
</script>

<template>
  <div class="header-row">
    <LeftSide />
    <CenterSide>
      <slot />
    </CenterSide>
    <div class="right-side-wrapper">
      <button class="button" @click="toggleSides">
        <i class="pi pi-arrows-h icon"></i>
      </button>
      <RightSide class="right-side" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-row {
  display: grid;
  grid-template-columns: min-content 1fr min-content;
}

.right-side-wrapper {
  display: flex;
  width: 300px;
  align-items: center;
  border-radius: 0px 0px 0px 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  background-color: $color-dark;
  padding: 10px;
  padding-right: 30px;
}

.right-side {
  justify-content: flex-end;
  flex: 1;
}

.icon {
  color: #fff;
  font-size: 20px;
}
</style>
