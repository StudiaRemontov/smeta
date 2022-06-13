<script>
import OutlayItem from './OutlayItem.vue'
import EditModal from './Modals/EditModal.vue'
import Menu from 'primevue/menu'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    OutlayItem,
    Menu,
    EditModal,
  },
  data() {
    return {
      selectedItem: null,
    }
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    selectedOutlay() {
      return this.outlays.find(o => o._id === this.selectedItem)
    },
    items() {
      return [
        {
          label: 'Сделать активной',
          command: async () => {
            try {
              await this.setActive(this.selectedItem)
            } catch (error) {
              const { response } = error
              const message = response ? response.data.message : error.message
              this.$toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: message,
                life: 3000,
              })
            }
          },
          disabled: this.selectedOutlay?.active,
        },
        {
          label: 'Редактировать',
          command: async () => {
            const response = await this.$refs['edit-modal'].show({
              okButton: 'Сохранить',
              cancelButton: 'Отмена',
              name: this.selectedOutlay.name,
            })
            try {
              await this.update({
                id: this.selectedItem,
                data: {
                  ...this.selectedOutlay,
                  ...response,
                },
              })
            } catch (error) {
              const { response } = error
              const message = response ? response.data.message : error.message
              this.$toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: message,
                life: 3000,
              })
            }
          },
          disabled: false,
        },
        {
          label: 'Клонировать',
          command: async () => {
            const outlay = this.outlays.find(o => o._id === this.selectedItem)
            const clone = JSON.parse(JSON.stringify(outlay))
            const data = {
              ...clone,
              active: false,
              date: undefined,
              _id: undefined,
            }
            try {
              await this.create(data)
            } catch (error) {
              const { response } = error
              const message = response ? response.data.message : error.message
              this.$toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: message,
                life: 3000,
              })
            }
          },
          disabled: false,
        },
        {
          label: 'Удалить',
          command: async () => {
            try {
              await this.remove(this.selectedItem)
            } catch (error) {
              const { response } = error
              const message = response ? response.data.message : error.message
              this.$toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: message,
                life: 3000,
              })
            } finally {
              this.selectedItem = null
            }
          },
          disabled: false,
        },
      ]
    },
    outlayList() {
      return [...this.outlays].reverse()
    },
  },
  methods: {
    ...mapActions('outlays', ['create', 'remove', 'setActive', 'update']),
    openMenu(e, id) {
      this.selectedItem = id
      this.$refs.menu.toggle(e)
    },
  },
}
</script>

<template>
  <Menu ref="menu" :model="items" :popup="true" />
  <EditModal ref="edit-modal" />
  <div v-if="outlays && outlays.length > 0" class="outlay-list">
    <OutlayItem
      v-for="outlay in outlayList"
      :key="outlay._id"
      :outlay="outlay"
      @open-menu="openMenu"
    />
  </div>
</template>

<style lang="scss" scoped>
.outlay-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  overflow-y: hidden;
  @include darkScroll;
}
</style>
