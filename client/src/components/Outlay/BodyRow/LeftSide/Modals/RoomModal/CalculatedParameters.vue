<script>
import InputNumber from 'primevue/inputnumber'

export default {
  components: {
    InputNumber,
  },
  props: {
    parameters: {
      type: Object,
      required: true,
    },
  },
}
</script>

<template>
  <div class="calculated-parameters">
    <div
      v-for="(val, key) in parameters"
      :key="key"
      class="calculated-parameter"
    >
      <label class="calculated-parameter__label">{{ key }}</label>
      <InputNumber
        :value="val"
        :placeholder="key"
        :disabled="true"
        :minFractionDigits="2"
        :maxFractionDigits="2"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calculated-parameters {
  display: flex;
  gap: 5px;
}

.calculated-parameter {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
