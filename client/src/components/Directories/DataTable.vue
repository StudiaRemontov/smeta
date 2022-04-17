<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import KeyModal from './Modals/KeyModal.vue'
import OutlinedPlusIcon from '@/components/UI/Icons/SquaredOutlinedPlusIcon.vue'
import PlusIcon from '@/components/UI/Icons/SquaredPlusIcon.vue'
import TableCell from './Table/TableCell.vue'
import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: { OutlinedPlusIcon, PlusIcon, KeyModal, TableCell },
  mixins: [keyTypes],
  props: {
    values: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapGetters('directory', ['root']),
    directoryId() {
      return this.$route.params.id
    },
    keys() {
      return this.root?.keys
    },
  },
  watch: {
    directoryId(newval, old) {
      if (!old) return
      this.removeEmptyRows({ id: old })
    },
  },
  methods: {
    ...mapMutations('directory', ['removeEmptyRows']),
    ...mapActions('directory', [
      'updateDirectoryKeys',
      'updateDirectoryValues',
      'createTableRow',
    ]),
    updateKey(key, value) {
      const keys = this.keys.map(item => {
        if (item.id === key) {
          return {
            ...item,
            ...value,
          }
        }
        return item
      })

      this.updateArchitecture(keys)
    },
    updateValue(rowId, key, value) {
      const newValues = JSON.parse(JSON.stringify(this.values))
      const values = newValues.map(row => {
        if (row.id === rowId) {
          row.data[key] = value
        }
        return row
      })

      this.updateValues(values)
    },
    async openKeyModal() {
      const response = await this.$refs['key-modal'].show({
        title: 'Добавить колонку',
        okButton: 'Добавить',
        cancelButton: 'Отмена',
      })
      if (!response) {
        return
      }
      const keys = [...this.keys, { id: Date.now(), ...response }]

      this.updateArchitecture(keys)
    },
    async openEditModal(key) {
      const response = await this.$refs['key-modal'].show({
        title: 'Изменить колонку',
        okButton: 'Сохранить',
        cancelButton: 'Отмена',
        key,
      })
      if (!response) {
        return
      }
      if (response.remove) {
        return this.removeKey(key.id)
      }

      this.updateKey(key.id, response)
    },
    async removeKey(keyId) {
      const keys = this.keys.filter(({ id }) => id !== keyId)

      if (keys.length === 0) {
        await this.updateValues([])
        return this.updateArchitecture([])
      }
      const values = this.values.map(row => {
        return Object.entries(row).reduce((acc, [key, value]) => {
          if (+key !== keyId) {
            acc[key] = value
          }
          return acc
        }, {})
      })
      this.updateArchitecture(keys)
      this.updateValues(values)
    },
    removeRow(rowIndex) {
      const values = this.values.filter((_, index) => index !== rowIndex)
      this.updateValues(values)
    },
    async updateValues(values) {
      try {
        await this.updateDirectoryValues({ id: this.directoryId, values })
      } catch (error) {
        console.log(error)
      }
    },
    async updateArchitecture(keys) {
      try {
        await this.updateDirectoryKeys(keys)
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>

<template>
  <KeyModal ref="key-modal" />
  <table class="table">
    <tr class="table__row table__row--head">
      <th
        v-for="key in keys"
        :key="key.name"
        class="table__cell table__cell--head"
        @click="openEditModal(key)"
      >
        {{ key.name }}
      </th>
      <th
        class="table__cell table__cell--head table__cell--clickable"
        @click="openKeyModal"
      >
        <PlusIcon />
      </th>
    </tr>
    <tr v-for="(row, rowIndex) in values" :key="row.id" class="table__row">
      <TableCell
        v-for="key in keys"
        :key="key.name"
        :value="values[rowIndex].data[key.id]"
        :rowIndex="rowIndex"
        :rowId="row.id"
        :col="key"
        :dirId="directoryId"
        @change="updateValue"
        ref="cell"
      />
      <td class="table__cell table__cell--empty">
        <AppButton variant="danger" outlined @click="removeRow(rowIndex)">
          Удалить
        </AppButton>
      </td>
    </tr>
  </table>
  <AppButton class="create-button" @click="createTableRow(directoryId)">
    <OutlinedPlusIcon />
    <span class="create-button__text"> Добавить элементы </span>
  </AppButton>
</template>

<style lang="scss" scoped>
.table {
  max-width: 100%;
  width: 100%;
  border-collapse: collapse;

  &__row--head {
    position: sticky;
    top: 0;
  }

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
      cursor: pointer;

      input {
        font-weight: 700;
      }
    }

    &--empty,
    &--clickable {
      border: 1px solid #c8c8c8;
      border-right: none;
    }

    &--clickable {
      text-align: center;
      width: 75px;
      cursor: pointer;
    }
  }

  &__input {
    background-color: transparent;
    border: none;
    outline: none;
    width: 100%;
  }

  &__create-row {
    text-align: center;
    cursor: pointer;
  }
}

.create-button {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;

  &__text {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
    color: #00afec;
  }
}
</style>
