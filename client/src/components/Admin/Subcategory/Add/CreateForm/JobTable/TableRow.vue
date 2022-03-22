<script>
import unitMixin from '@/mixins/units.mixin.js'

export default {
  props: {
    name: {
      required: true,
      default: '',
      type: String,
    },
    unit: {
      required: true,
      default: null,
      type: String,
    },
    price: {
      required: true,
      default: 0,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:name', 'update:unit', 'update:price'],
  mixins: [unitMixin],
}
</script>

<template>
  <tr>
    <td class="table-cell">
      {{ rowIndex + 1 }}
    </td>
    <td class="table-cell">
      <input
        class="table-input"
        :value="name"
        @input="$emit('update:name', $event.target.value)"
      />
    </td>
    <td class="table-cell">
      <select
        class="table-select"
        :value="unit"
        @change="$emit('update:unit', $event.target.value)"
      >
        <option value="" hidden selected>Выберите ед изменерия</option>
        <option v-for="unit in units" :key="unit" :value="unit">
          {{ unit }}
        </option>
      </select>
    </td>
    <td class="table-cell">
      <input
        class="table-input"
        type="number"
        :value="price"
        step="0.01"
        @input="$emit('update:price', $event.target.value)"
      />
    </td>
    <td class="table-cell">
      <AppButton variant="danger" @click="$emit('remove')">Удалить</AppButton>
    </td>
  </tr>
</template>

<style></style>
