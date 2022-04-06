<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    keys() {
      return this.data.keys
    },
    values() {
      return this.data.values
    },
  },
  methods: {
    toggleRows() {},
    selectRow(rowId) {},
  },
}
</script>

<template>
  <table class="table">
    <tr class="table__row">
      <th class="table__cell table__cell--head">
        <input type="checkbox" @change="toggleRows" />
      </th>
      <th
        v-for="key in keys"
        :key="key.id"
        class="table__cell table__cell--head"
      >
        <div>
          <input type="checkbox" :checked="key.checked" />
          {{ key.name }}
        </div>
        <input type="checkbox" :checked="key.readonly" />
        <span>Только для чтения</span>
      </th>
    </tr>
    <tr v-for="row in values" :key="row.id" class="table__row">
      <td class="table__cell">
        <input type="checkbox" :checked="row.checked" />
      </td>
      <td v-for="key in keys" :key="key.id" class="table__cell">
        {{ row.data[key.id] }}
      </td>
    </tr>
  </table>
</template>

<style lang="scss" scoped>
.table {
  max-width: 100%;
  width: 100%;
  border-collapse: collapse;

  &__cell {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    color: white;
    border-top: 1px solid #c8c8c8;
    border-bottom: 1px solid #c8c8c8;
    padding: 8px;
    color: #000000;
    line-height: 17px;

    &--head {
      background-color: #f5f5f5;
    }
  }
}
</style>
