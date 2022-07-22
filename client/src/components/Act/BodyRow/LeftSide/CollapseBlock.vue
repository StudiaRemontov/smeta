<script>
import OutlayBlock from '@/components/Layout/Outlay/OutlayBlock.vue'

export default {
  components: { OutlayBlock },
  props: {
    position: {
      type: String,
      default: 'left',
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  methods: {
    toggle() {
      return this.$emit('update:modelValue', !this.modelValue)
    },
  },
}
</script>

<template>
  <OutlayBlock class="collapse-block" :class="position">
    <button
      class="collapse-button button"
      :class="[
        { rotated: position === 'left' ? !modelValue : modelValue },
        { hidden: !modelValue },
      ]"
      @click="toggle"
    >
      <i class="pi pi-angle-double-left" />
    </button>
  </OutlayBlock>
</template>

<style lang="scss" scoped>
.collapse-block {
  padding: 10px;
  display: flex;

  &.left {
    justify-content: flex-end;
  }

  &.right {
    justify-content: flex-start;
  }
}

.collapse-button {
  display: flex;
  gap: 5px;
  transition: transform 0.2s ease-in-out;

  &.rotated {
    transform: rotate(180deg);
  }

  &.hidden {
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  .pi {
    font-size: 20px;
  }
}
</style>
