<script>
export default {
  props: {
    name: {
      required: true,
      type: String,
    },
    value: {
      required: true,
    },
  },
}
</script>

<template>
  <div class="parameter">
    <label class="parameter__name">
      {{ name }}
    </label>
    <input :value="value" class="parameter__input" />
  </div>
</template>

<style lang="scss" scoped>
.parameter {
  display: flex;
  flex-direction: column;
  gap: 3px;

  &__name,
  &__input {
    font-size: 12px;
    font-weight: 400;
    line-height: 15px;
  }

  &__input {
    pointer-events: none;
    max-width: 100%;
    width: 100%;
    border: 1px solid #c8c8c8;
    border-radius: 5px;
    text-align: center;
    padding: 5px;
  }
}
</style>
