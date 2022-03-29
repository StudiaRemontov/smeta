<script>
import { mapGetters, mapMutations } from 'vuex'
import CreateKey from './Modals/CreateKey.vue'
import OutlinedPlusIcon from '@/components/UI/Icons/SquaredOutlinedPlusIcon.vue'
import PlusIcon from '@/components/UI/Icons/SquaredPlusIcon.vue'

export default {
  components: { CreateKey, OutlinedPlusIcon, PlusIcon },
  props: {
    keys: {
      type: Array,
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
  },
  computed: {
    ...mapGetters('directory', ['selectedDirectory']),
  },
  methods: {
    ...mapMutations('directory', ['updateArchitecture']),
    updateKey(key, value) {
      const keys = this.keys.map(item => {
        if (item.name === key) {
          return {
            ...item,
            name: value,
          }
        }
        return item
      })
      this.updateArchitecture({ keys })
    },
    updateValue(rowIndex, key, value) {
      const values = this.values.map((row, index) => {
        if (index === rowIndex) {
          row[key] = value
        }
        return row
      })
      this.updateArchitecture({ values })
    },
    async openKeyModal() {
      const response = await this.$refs['create-key'].show({
        title: 'Добавить колонку',
        okButton: 'Добавить',
        cancelButton: 'Отмена',
      })
      if (!response) {
        return
      }
      const keys = [...this.keys, response]
      this.updateArchitecture({ keys })
    },
    createRow() {
      const row = this.keys.reduce((acc, item) => {
        acc[item.id] = ''
        return acc
      }, {})
      const values = [...this.values, row]
      this.updateArchitecture({ values })
    },
  },
}
</script>

<template>
  <table class="table">
    <tr class="table__row">
      <th
        v-for="key in keys"
        :key="key.name"
        class="table__cell table__cell--head"
      >
        <input
          :value="key.name"
          class="table__input"
          type="text"
          @change="updateKey(key.name, $event.target.value)"
        />
      </th>
      <th
        class="table__cell table__cell--head table__cell--clickable"
        @click="openKeyModal"
      >
        <PlusIcon />
      </th>
    </tr>
    <tr v-for="(row, rowIndex) in values" :key="rowIndex" class="table__row">
      <td v-for="key in keys" :key="key.name" class="table__cell">
        <input
          :value="values[rowIndex][key.id]"
          class="table__input"
          type="text"
          @change="updateValue(rowIndex, key.id, $event.target.value)"
        />
      </td>
      <td class="table__cell table__cell--empty"></td>
    </tr>
  </table>
  <AppButton class="create-button" @click="createRow">
    <OutlinedPlusIcon />
    <span class="create-button__text"> Добавить элементы </span>
  </AppButton>
  <CreateKey ref="create-key" />
</template>

<style lang="scss" scoped>
.table {
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
