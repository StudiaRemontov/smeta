<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'DirectoryItem',
  props: {
    directory: {
      type: Object,
      required: true,
    },
    root: {
      type: String,
    },
    parent: Object,
    value: {
      required: true,
    },
  },
  data() {
    return {
      subItemsVisible: false,
    }
  },
  computed: {
    ...mapGetters('directory', ['roots']),
    ...mapGetters('edition', ['clonedDirectories']),
    children() {
      return this.clonedDirectories.filter(d => d.parent === this.directory._id)
    },
    subItems() {
      return this.directory?.subItems || []
    },
    keys() {
      if (this.directory.values) {
        const root = this.roots.find(r => r._id === this.root)
        return root.keys
      }
      return null
    },
    selectedValues: {
      get() {
        return this.directory.selectedValues
      },
      set(value) {
        this.setSelectedValues({ id: this.directory._id, value })
        if (value.length === 0) {
          const subItems = this.parent.subItems.filter(
            i => i._id !== this.directory._id,
          )
          return this.setSubItems({ id: this.parent._id, value: subItems })
        }
        if (value.length > 0) {
          const isChecked = !!this.parent.subItems.find(
            i => i._id === this.directory._id,
          )
          if (isChecked) {
            return
          }
          this.$emit('checked', true)
          const subItems = [...this.parent.subItems, this.directory]
          return this.setSubItems({ id: this.parent._id, value: subItems })
        }
      },
    },
    isChecked() {
      if (!this.value) {
        return false
      }
      if (!this.parent) {
        return this.directory._id === this.value._id
      }
      return this.parent.subItems.find(i => i._id === this.directory._id)
    },
    selectAll: {
      get() {
        return this.selectedValues?.length === this.directory.values.length
      },
      set(value) {
        if (value) {
          return this.setSelectedValues({
            id: this.directory._id,
            value: this.directory.values,
          })
        }
        this.setSelectedValues({
          id: this.directory._id,
          value: [],
        })
        const subItems = this.parent.subItems.filter(
          i => i._id !== this.directory._id,
        )
        this.setSubItems({ id: this.parent._id, value: subItems })
      },
    },
  },
  methods: {
    ...mapMutations('edition', ['updateKey', 'setSelectedValues']),
    ...mapActions('edition', ['setSubItems']),
    changeKeyHandler(keyId, value, field) {
      this.updateKey({
        id: this.root,
        value,
        keyId,
        field,
      })
    },
    changeHandler(checked) {
      if (!this.parent) {
        const value = checked ? this.directory : null
        return this.$emit('checked', value)
      }
      if (this.parent?._id) {
        let currValue = [...this.parent.subItems]
        if (checked) {
          const isExists = currValue.find(d => d._id === this.directory._id)
          if (isExists) {
            return
          }
          currValue.push(this.directory)
          this.checkParents()
        } else {
          currValue = currValue.filter(d => d._id !== this.directory._id)
        }
        return this.setSubItems({ id: this.parent._id, value: currValue })
      }
    },
    checkParents() {
      this.$emit('checked', true)
    },
  },
}
</script>

<template>
  <div class="directory-item">
    <div
      class="directory-item__header"
      @click="subItemsVisible = !subItemsVisible"
    >
      <div class="directory-item__actions" @click.stop>
        <div>
          <input
            type="checkbox"
            :id="directory._id"
            :value="directory._id"
            :checked="isChecked"
            @change="changeHandler($event.target.checked)"
          />
          <label :for="directory._id">{{ directory.name }}</label>
        </div>
        <div v-if="directory.values && isChecked">
          <input
            v-model="selectAll"
            type="checkbox"
            :id="`all-${directory._id}`"
          />
          <label :for="`all-${directory._id}`">Выбрать все</label>
        </div>
      </div>
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
      <template v-if="children.length">
        <DirectoryItem
          v-for="child in children"
          :key="child._id"
          :directory="child"
          :root="root"
          :parent="directory"
          :value="child"
          @checked="changeHandler"
        />
      </template>
      <table v-else-if="directory.values" class="table">
        <col width="30px" />
        <tr v-for="value in directory.values" :key="value">
          <td class="cell">
            <input v-model="selectedValues" :value="value" type="checkbox" />
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
.directory-item {
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
