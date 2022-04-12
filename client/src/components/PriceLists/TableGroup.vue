<script>
export default {
  props: {
    group: {
      type: Object,
    },
    keys: {
      type: Array,
    },
  },
  computed: {
    subGroups() {
      return this.group.subItems
    },
  },
}
</script>

<template>
  <table class="table">
    <tr>
      <th class="cell">
        {{ group.name }}
      </th>
    </tr>
  </table>
  <template v-if="subGroups.length > 0">
    <TableGroup
      v-for="subGroup in subGroups"
      :key="subGroup._id"
      :group="subGroup"
      :keys="keys"
    />
  </template>
  <table v-if="group.values.length > 0" class="table">
    <tr v-for="value in group.values" :key="value">
      <td v-for="key in keys" :key="key.id" class="cell">
        {{ value.data[key.id] }}
      </td>
    </tr>
  </table>
</template>

<style lang="scss" scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  &--keys {
    position: sticky;
    top: 0;
    background-color: #fff;
  }
}

.cell {
  padding: 10px 0;
  text-align: center;
  border: 1px solid #a7a7a7;
}
</style>
