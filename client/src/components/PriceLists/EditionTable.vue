<script>
import { mapGetters } from 'vuex'
import TableGroup from './TableGroup.vue'
export default {
  components: {
    TableGroup,
  },
  props: {
    edition: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('directory', ['roots']),
    ...mapGetters('edition', ['editions']),
    keys() {
      return this.edition.keys
    },
    subItems() {
      return this.edition?.subItems || []
    },
    groups() {
      return this.edition.data
    },
  },
}
</script>

<template>
  <div class="edition">
    <div class="edition__header">
      <div>
        <label>{{ edition.name }}</label>
      </div>
    </div>
    <table class="table table--keys">
      <tr>
        <th v-for="key in keys" :key="key.id" class="cell">
          <span>
            {{ key.name }}
          </span>
        </th>
      </tr>
    </table>
    <template v-if="groups.length > 0">
      <TableGroup
        v-for="group in groups"
        :key="group._id"
        :keys="keys"
        :group="group"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.edition {
  display: flex;
  flex-direction: column;

  &__header {
    font-weight: bold;
    padding: 10px 0;
    border: 1px solid #a7a7a7;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__actions {
    min-width: 110px;
  }
}
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
