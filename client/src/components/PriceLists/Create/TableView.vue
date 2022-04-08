<script>
import { mapMutations } from 'vuex'
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    dirId: {
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
    allRowsSelected: {
      get() {
        return !this.values.some(r => !r.checked)
      },
      set(value) {
        this.checkAllRows({ id: this.dirId, value })
      },
    },
  },
  methods: {
    ...mapMutations('edition', ['checkRow', 'checkAllRows', 'updateKey']),
    changeRowHandler(rowId, value) {
      this.checkRow({ id: this.dirId, rowId, value })
    },
    changeKeyHandler(keyId, value, field) {
      this.updateKey({ id: this.dirId, keyId, value, field })
    },
  },
}
</script>

<template>
  <table class="table">
    <col width="25" />
    <tr class="table__row">
      <th class="table__cell table__cell--head">
        <input v-model="allRowsSelected" type="checkbox" />
      </th>
      <th
        v-for="key in keys"
        :key="key.id"
        class="table__cell table__cell--head"
      >
        <div>
          <input
            type="checkbox"
            :checked="key.checked"
            @change="changeKeyHandler(key.id, $event.target.checked)"
          />
          {{ key.name }}
        </div>
        <template v-if="key.checked">
          <input
            type="checkbox"
            :checked="key.readonly"
            @change="
              changeKeyHandler(key.id, $event.target.checked, 'readonly')
            "
          />
          <span>Только для чтения</span>
        </template>
      </th>
    </tr>
    <tr v-for="row in values" :key="row.id" class="table__row">
      <td class="table__cell">
        <input
          type="checkbox"
          :checked="row.checked"
          @change="changeRowHandler(row.id, $event.target.checked)"
        />
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
  table-layout: fixed;

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
