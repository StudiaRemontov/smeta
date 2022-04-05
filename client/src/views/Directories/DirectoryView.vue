<script>
import AppContent from '@/components/Layout/AppContent.vue'
import SearchInput from '@/components/UI/SearchInput.vue'
import DirectoryList from '@/components/Directories/DirectoryList.vue'
import DirectoryForm from '@/components/Directories/DirectoryForm.vue'
import CreateButton from '@/components/Directories/CreateButton.vue'
import DataTable from '@/components/Directories/DataTable.vue'

import * as XLSX from 'xlsx/xlsx.mjs'

import { mapActions, mapGetters } from 'vuex'

import keyTypes from '@/mixins/keyTypes.mixin'

export default {
  components: {
    AppContent,
    SearchInput,
    DirectoryList,
    CreateButton,
    DirectoryForm,
    DataTable,
  },
  mixins: [keyTypes],
  data() {
    return {
      search: '',
      showCreateFolder: false,
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'selectedDirectory']),
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
    parentTree() {
      if (!this.directory) {
        return null
      }

      return this.getParentTree(this.directory)
    },
    architectureValues() {
      console.log('generate')
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
    ...mapActions('directory', ['updateById']),
    getParentTree(directory) {
      if (directory.parent) {
        const parent = this.directories.find(
          ({ _id }) => _id === directory.parent,
        )
        return [...this.getParentTree(parent), directory]
      }
      return [directory]
    },
    openCreateDirectory() {
      this.showCreateFolder = true
    },
    async createArchitecture() {
      try {
        await this.updateById({
          id: this.directory._id,
          data: {
            data: {
              keys: [],
              values: [],
            },
          },
        })
      } catch (error) {
        console.log(error)
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
    async readFile(e) {
      //get file and read it
      const file = e.target.files[0]
      const rows = await this.readExcel(file)
      if (rows.length === 0) {
        return
      }
      //generate keys
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
      // get all values of column to find type of column (key)
      const columns = keys.map((key, keyIndex) => {
        return values.map(row => {
          return row[keyIndex]
        })
      })
      //find type of column and set it to keys
      // формирование ключей для сохранения в базу
      const keysWithType = keys.map((key, index) => {
        const type = this.getTypeOfColumn(columns[index])
        return {
          ...key,
          ...type,
        }
      })
      //формирование значений таблицы
      //для каждой строки из excel
      const tableRows = values.map((value, rowIndex) => {
        //формирование данных строки
        const data = keysWithType.reduce((acc, key, index) => {
          if (key.type === this.InputType.SELECT) {
            // получаю архитектуру из которой берутся значения
            const dir = this.directories.find(d => d._id === key.dirId)
            //нахожу строку в которой находится значение из excel
            //скорее всего это работает только когда из справочника берется значение строки с 1 ключем (длина массива key.keys равна 1)
            const row = dir.data.values.find(r => {
              const values = key.keys.map(key => r.data[key])
              return values.includes(value[index])
            })

            acc[key.id] = row.id
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

      try {
        await this.updateById({
          id: this.directory._id,
          data: {
            data: {
              keys: keysWithType,
              values: tableRows,
            },
          },
        })
      } catch (error) {
        console.log(error)
      }
    },
    async readExcel(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function (e) {
          const data = e.target.result
          const workbook = XLSX.read(data, {
            type: 'binary',
          })

          const sheetsNames = workbook.SheetNames
          const firstSheet = workbook.Sheets[sheetsNames[0]]

          const xlRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

          resolve(xlRows)
        }

        reader.onerror = function () {
          reject([])
        }

        reader.readAsBinaryString(file)
      })
    },
  },
}
</script>

<template>
  <AppContent v-if="directory">
    <template #header>
      <div class="links">
        <RouterLink class="link" to="/directories">
          <span class="link__text"> Справочники </span>
          <span class="link__delimeter">/</span></RouterLink
        >
        <template v-if="parentTree">
          <RouterLink
            v-for="(parent, index) in parentTree"
            :key="parent._id"
            :to="`/directories/${parent._id}`"
            class="link"
          >
            <span class="link__text">
              {{ parent.name }}
            </span>
            <span v-if="index < parentTree.length - 1" class="link__delimeter"
              >/</span
            >
          </RouterLink>
        </template>
      </div>
    </template>
    <template #body-header>
      <div class="header">
        <SearchInput v-model="search" class="search-input" />
        <div class="header__actions">
          <label class="file-uploader" for="file">Импорт из Excel файла</label>
          <input type="file" id="file" hidden @change="readFile" />
        </div>
      </div>
    </template>
    <template #body-content>
      <div class="create-form" v-if="showCreateFolder">
        <DirectoryForm
          :parent="this.directory._id"
          @created="showCreateFolder = false"
        />
      </div>
      <div v-else-if="!subFolders.length && !directory.data" class="choose">
        <CreateButton text="Создать папку" @click="openCreateDirectory" />
        <CreateButton text="Создать архитектуру" @click="createArchitecture" />
      </div>
      <div v-else-if="subFolders.length && !directory.data" class="directories">
        <DirectoryList :items="subFolders" />
      </div>
      <div v-else>
        <DataTable :directory="directory" />
      </div>
    </template>
  </AppContent>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  max-width: 400px;
  width: 100%;
}

.button-create {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 9px;
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

.links {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
}

.link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;

  &__text {
    font-weight: 700;
    color: #000;
    font-size: $font-high;
  }

  &__delimeter {
    font-weight: 700;
  }
}
.file-uploader {
  cursor: pointer;
  background: #ffffff;
  padding: 10px;
  border: 1px solid #a7a7a7;
  border-radius: 3px;
}
</style>
