<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'RootItem',
  props: {
    directory: {
      type: Object,
      required: true,
    },
    root: {
      type: String,
    },
  },
  data() {
    return {
      subItemsVisible: false,
    }
  },
  computed: {
    ...mapGetters('directory', ['roots']),
    checked: {
      get() {
        return this.directory.checked
      },
      set(value) {
        this.checkDirectory({ id: this.directory._id, value })
      },
    },
    keys() {
      if (this.directory.values) {
        const root = this.roots.find(r => r._id === this.root)
        return root.keys
      }
      return null
    },
  },
  watch: {
    checked(value) {
      this.subItemsVisible = value
    },
  },
  methods: {
    ...mapMutations('edition', ['checkAllRows', 'updateKey']),
    ...mapActions('edition', ['checkDirectory']),
    changeKeyHandler(keyId, value, field) {
      this.updateKey({
        id: this.root,
        value,
        keyId,
        field,
      })
    },
  },
}
</script>

<template>
  <div class="directory">
    <div class="directory__name" @click="subItemsVisible = !subItemsVisible">
      <span @click.stop>
        <input v-model="checked" type="checkbox" :id="directory._id" />
        <label :for="directory._id">{{ directory.name }}</label>
      </span>
    </div>
    <template v-if="subItemsVisible">
      <table v-if="!directory.parent" class="table table--keys">
        <col width="30px" />
        <tr>
          <th class="cell"></th>
          <th v-for="key in directory.keys" :key="key.id" class="cell">
            <span>
              {{ key.name }}
              <input
                type="checkbox"
                :checked="key.checked"
                @change="changeKeyHandler(key.id, $event.target.checked)"
              />
            </span>
            <div v-if="key.checked">
              <label for="">Только для чтения</label>
              <input
                type="checkbox"
                :checked="key.readonly"
                @change="
                  changeKeyHandler(key.id, $event.target.checked, 'readonly')
                "
              />
            </div>
          </th>
        </tr>
      </table>
      <template v-if="directory.subItems.length">
        <RootItem
          v-for="child in directory.subItems"
          :key="child._id"
          :directory="child"
          :root="root"
        />
      </template>
      <table v-else-if="directory.values" class="table">
        <col width="30px" />
        <tr v-for="value in directory.values" :key="value">
          <td class="cell">
            <input type="checkbox" :checked="value.checked" />
          </td>
          <td v-for="key in keys" :key="key._id" class="cell">
            <span>
              {{ value.data[key.id] }}
            </span>
          </td>
        </tr>
      </table>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.directory {
  display: flex;
  flex-direction: column;

  &__name {
    text-align: center;
    font-weight: bold;
    padding: 10px 0;
    border: 1px solid #a7a7a7;
    user-select: none;
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
