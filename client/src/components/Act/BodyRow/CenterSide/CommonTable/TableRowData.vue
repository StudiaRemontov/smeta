<script>
import { formatNumber } from '@/helpers/formatNumber'
import { mapGetters } from 'vuex'

export default {
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    isCategory: {
      type: Boolean,
      default: false,
    },
    added: Boolean,
    canRemove: Boolean,
    loading: Boolean,
  },
  emits: ['remove'],
  computed: {
    ...mapGetters('outlay', ['keys', 'quantityKey', 'priceKey']),
    sum() {
      const quantity = this.data.quantity
      const price = this.data[this.priceKey.id]
      return formatNumber(quantity * price)
    },
    rowData() {
      const formattedKeys = [this.quantityKey.id, this.priceKey.id, 'quantity']
      return this.keys.map(key => {
        if (formattedKeys.includes(key.id)) {
          const value =
            key.id === this.quantityKey.id
              ? this.data.quantity
              : this.data[key.id]
          return {
            key: key.id,
            value: formatNumber(value),
          }
        }
        return {
          key: key.id,
          value: this.data[key.id],
        }
      })
    },
  },
  methods: {
    removeJob() {
      this.$emit('remove')
    },
  },
}
</script>

<template>
  <template v-if="isCategory">
    <div class="table-cell">{{ rowData[0].value }}</div>
  </template>
  <template v-else v-for="(row, index) in rowData" :key="row.key">
    <div
      v-if="index === 0"
      v-tooltip.top="row.value"
      class="table-cell"
      :class="{ quantity: row.key === quantityKey.id }"
    >
      <button
        v-if="added"
        class="table-cell__button button"
        :disabled="!canRemove || loading"
        @click="removeJob"
      >
        <i class="pi pi-times"></i>
      </button>
      <span>
        {{ row.value }}
      </span>
    </div>
    <div
      v-else
      class="table-cell"
      :title="row.value"
      :class="{ quantity: row.key === quantityKey.id }"
    >
      {{ row.value }}
    </div>
  </template>
  <div v-if="!isCategory" class="table-cell">
    {{ sum }}
  </div>
</template>

<style lang="scss" scoped>
.table-cell {
  white-space: nowrap;
  @include table-cell;
  display: flex;
  align-items: center;
  gap: 5px;

  &.quantity {
    font-weight: 700;
  }

  &__button {
    color: #de4848;

    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
