<script>
export default {
  computed: {
    hasHeaderSlot() {
      return !!this.$slots.header
    },
  },
}
</script>

<template>
  <div class="content-body">
    <div v-if="hasHeaderSlot" class="content-body__header">
      <slot name="header" />
    </div>
    <div class="content-body__content">
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-height: 0px;

  &__content {
    flex: 1;
    padding-right: 5px;
    overflow-y: auto;
    padding-bottom: 10px;

    @include darkScroll;
  }
}
</style>
