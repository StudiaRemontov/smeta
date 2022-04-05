<script>
import { mapGetters } from 'vuex'

import * as XLSX from 'xlsx/xlsx.mjs'

export default {
  emits: ['change'],
  computed: {
    ...mapGetters('directory', ['directories']),
  },
  methods: {
    async fileChangeHandler(e) {
      //get file and read it
      const file = e.target.files[0]
      e.target.value = ''
      const rows = await this.readExcel(file)
      this.$emit('change', rows)
    },
    readExcel(file) {
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
  <label class="file-uploader" for="file">Импорт из Excel</label>
  <input type="file" id="file" hidden @change="fileChangeHandler" />
</template>

<style lang="scss" scoped>
.file-uploader {
  cursor: pointer;
  background: #ffffff;
  padding: 10px;
  border: 1px solid #a7a7a7;
  border-radius: 3px;
  display: inline-block;
}
</style>
