<script>
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import DirectoryForm from '@/components/Directories/DirectoryForm.vue'
import CreateButton from '@/components/Directories/CreateButton.vue'
import DataTable from '@/components/Directories/DataTable.vue'
import ExcelModal from '@/components/Directories/Modals/ExcelModal.vue'
import ExcelUploader from '@/components/Directories/ExcelUploader.vue'
import RemoveModal from '@/components/Directories/Modals/RemoveModal.vue'
import ContentBody from '@/components/Layout/ContentBody.vue'

import { mapActions, mapGetters } from 'vuex'

import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: {
    ContentBody,
    SearchInput,
    DirectoryList,
    CreateButton,
    DirectoryForm,
    DataTable,
    ExcelModal,
    ExcelUploader,
    RemoveModal,
  },
  mixins: [keyTypes],
  data() {
    return {
      search: '',
      showCreateFolder: false,
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'root']),
    directoryId() {
      return this.$route.params.id
    },
    directory() {
      if (!this.directoryId) {
        return null
      }

      return this.directories.find(
        directory => directory._id === this.directoryId,
      )
    },
    subFolders() {
      if (!this.directory) {
        return []
      }

      return this.directories.filter(d => d.parent === this.directory._id)
    },
    architectureValues() {
      //get all architectures that can be architecture of current
      const architectures = this.directories.filter(
        d => d.data && d._id !== this.directoryId && d.data?.values?.length > 0,
      )
      // создается массив из архитетур с id архитектуры и массивом колонок с возможными значениями
      // это нужно для сопостовления значений с экселем
      return architectures.map(arc => {
        const keys = arc.data.keys.filter(k => k.type !== this.InputType.SELECT)

        const keyValues = keys.map(key => {
          const obj = {
            keyId: key.id,
            value: arc.data.values.map(val => val.data[key.id]),
          }

          return obj
        })

        return {
          dirId: arc._id,
          values: keyValues,
        }
      })
    },
  },
  methods: {
    ...mapActions('directory', ['updateById', 'updateDirectoryValues']),
    openCreateDirectory() {
      this.showCreateFolder = true
    },
    async createArchitecture() {
      await this.updateValues([])
    },
    async removeArchitecture() {
      if (this.directory.values.length === 0) {
        return await this.updateValues(false)
      }
      const response = await this.$refs['remove-modal'].show({
        title: 'Подтвердить удаление',
        message:
          'В данной архитектуре есть данные, при удалении данные будут утеряны',
        cancelButton: ' Отмена',
        okButton: 'Удалить',
        folderName: this.directory.name,
      })
      if (response) {
        await this.updateValues(false)
      }
    },
    getTypeOfColumn(column) {
      //keyid - id of key in other architecture
      let keyId = null
      //нахожу подходящую архитектуру для колонки
      const architecture = this.architectureValues.find(arc => {
        keyId = null
        const key = arc.values.find(value => {
          return column.every(val => value.value.includes(val))
        })
        //если все значения из колонки совпадают с существующей, сохраняем id ключа
        //он понадобится для выборки значений из нужной колонки справочника
        if (key) {
          keyId = key.keyId
          return true
        }
      })
      //если значения не совпадают
      if (!architecture) {
        const type =
          typeof column[0] === 'string'
            ? this.InputType.STRING
            : this.InputType.NUMBER

        return {
          type,
        }
      }
      //указываю из какой архитектуры берется значение и из каких колонок
      return {
        type: this.InputType.SELECT,
        keys: [keyId],
        dirId: architecture.dirId,
      }
    },
    async fileChangeHandler(rows) {
      if (rows.length === 0) {
        return
      }

      if (this.directory.values?.length > 0) {
        const response = await this.$refs['excel-modal'].show({
          title: 'Добавить данные или заменить существующие?',
          okButton: 'Добавить',
          cancelButton: 'Заменить',
        })
        if (response) {
          const mergedData = this.mergedData(rows)
          mergedData.values = [...this.directory.values, ...mergedData.values]
          const { keys, values } = mergedData
          await this.updateArchitecture(keys)
          return await this.updateValues(values)
        }
      }
      const { keys, values } = this.replacedData(rows)

      await this.updateArchitecture(keys)
      await this.updateValues(values)
    },
    async updateArchitecture(keys) {
      if (!this.root) return
      try {
        await this.updateById({
          id: this.root._id,
          data: {
            keys,
          },
        })
      } catch (error) {
        console.log(error)
      }
    },
    async updateValues(values) {
      try {
        await this.updateDirectoryValues({
          id: this.directory._id,
          values,
        })
      } catch (error) {
        console.log(error)
      }
    },
    getExcelKeysAndValues(rows) {
      const keys = rows[0].map((item, index) => {
        const key = {
          name: item,
          id: Date.now() + index,
        }

        return key
      })
      //get values of excel remove first row (keys)
      const values = [...rows]
      values.shift()
      return { keys, values }
    },
    getTableKeys(keys, values) {
      // get all values of column to find type of column (key)
      const columns = keys.map((key, keyIndex) => {
        return values.map(row => {
          return row[keyIndex]
        })
      })

      // формирование ключей для сохранения в базу
      return keys.map((key, index) => {
        if (key.type) {
          return key
        }
        const typeData = this.getTypeOfColumn(columns[index])

        return {
          ...key,
          ...typeData,
        }
      })
    },
    getTableValues(keys, values) {
      //для каждой строки из excel
      return values.map((value, rowIndex) => {
        //формирование данных строки
        const data = keys.reduce((acc, key, index) => {
          if (key.type === this.InputType.SELECT) {
            // получаю архитектуру из которой берутся значения
            const dir = this.directories.find(d => d._id === key.dirId)
            //нахожу строку в которой находится значение из excel
            //скорее всего это работает только когда из справочника берется значение строки с 1 ключем (длина массива key.keys равна 1)
            const row = dir.data.values.find(r => {
              const values = key.keys.map(key => r.data[key])
              return values.includes(value[index])
            })
            // no data - произвольная строка (truthy значение), т.к. если будет falsy значение строка автоматически удалится при изменении архитектуры
            acc[key.id] = row?.id || 'no data'
            return acc
          }

          acc[key.id] = value[index]
          return acc
        }, {})

        return {
          id: Date.now() + rowIndex,
          data,
        }
      })
    },
    replacedData(rows) {
      //generate keys
      const { keys, values } = this.getExcelKeysAndValues(rows)
      //формирование ключей таблицы
      const tableKeys = this.getTableKeys(keys, values)
      //формирование значений таблицы
      const tableValues = this.getTableValues(tableKeys, values)

      return {
        keys: tableKeys,
        values: tableValues,
      }
    },
    mergedData(rows) {
      //generate keys
      const { keys, values } = this.getExcelKeysAndValues(rows)
      //фильтрую ключи. Если название ключа из новой архитектурой совпадает с ключом из существующей,
      //то оставляю старый ключ, чтобы под его тип указать значение
      const merged = [...this.directory.data.keys, ...keys].filter(
        (key, index, arr) => index === arr.findIndex(k => key.name === k.name),
      )

      //формирование ключей таблицы
      const tableKeys = this.getTableKeys(merged, values)

      //формирование значений таблицы
      const tableValues = this.getTableValues(tableKeys, values)

      return {
        keys: tableKeys,
        values: tableValues,
      }
    },
  },
}
</script>

<template>
  <ContentBody v-if="directory">
    <template #header>
      <ExcelModal ref="excel-modal" />
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
        <div
          v-if="!subFolders.length && directory.values"
          class="header__actions"
        >
          <div class="header__actions-group">
            <AppButton outlined @click="removeArchitecture">
              Удлаить архитектуру
            </AppButton>
          </div>
          <ExcelUploader @change="fileChangeHandler" />
        </div>
      </div>
    </template>
    <template #content>
      <RemoveModal ref="remove-modal" />
      <div class="create-form" v-if="showCreateFolder">
        <DirectoryForm @created="showCreateFolder = false" />
      </div>
      <div v-else-if="!subFolders.length && !directory.values" class="choose">
        <CreateButton text="Создать папку" @click="openCreateDirectory" />
        <CreateButton text="Создать архитектуру" @click="createArchitecture" />
      </div>
      <DirectoryList
        v-else-if="subFolders.length && !directory.values"
        :items="subFolders"
      />
      <DataTable v-else :values="directory.values" />
    </template>
  </ContentBody>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  &__actions,
  &__actions-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  &__actions-group {
    gap: 5px;
  }
}

.search-input {
  max-width: 400px;
  width: 100%;
}

.choose {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.create-form {
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 130px;
  gap: 20px;
}
</style>
