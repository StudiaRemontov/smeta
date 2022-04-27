<script>
import OutlayItem from './OutlayItem.vue'
import CreateButton from '../Directories/CreateButton.vue'
// import DirectoryForm from './DirectoryForm.vue'
// import RemoveModal from './Modals/RemoveModal.vue'
// import AlertModal from './Modals/AlertModal.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    OutlayItem,
    CreateButton,
  },
  props: {
    items: {
      type: Array,
    },
  },
  data() {
    return {
      formVisible: false,
    }
  },
  methods: {
    // ...mapActions('directory', ['removeDirectory']),
    // async openRemove({ id, folderName, subItemsLength }) {
    //   const response = await this.$refs['remove-modal'].show({
    //     title: `Подтвердить удаление`,
    //     message: `Данная папка создаржит ${subItemsLength} элемента. При удалении этой папки все вложенные элементы будут удалены.`,
    //     folderName,
    //     okButton: 'Удалить',
    //     cancelButton: 'Отмена',
    //   })
    //   if (response) {
    //     try {
    //       await this.removeDirectory(id)
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   }
    // },
    // openAlert({ priceList, directories }) {
    //   this.$refs['alert-modal'].show({
    //     title: `Данный справочник невозможно удалить`,
    //     directories,
    //     priceList,
    //     okButton: 'Ок',
    //   })
    // },
  },
}
</script>

<template>
  <ul class="outlay-list">
    <OutlayItem />
    <!-- <DirectoryForm v-if="formVisible" @created="formVisible = false" /> -->
    <CreateButton text="Создать смету" @click="formVisible = true" />
    <!-- <RemoveModal ref="remove-modal" />
    <AlertModal ref="alert-modal" /> -->
  </ul>
</template>

<style lang="scss" scoped>
.outlay-list {
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 130px;
  gap: 20px;
}
</style>
