<script>
import Button from 'primevue/button'

import OutlayItem from './OutlayItem.vue'
import CreateModal from './Modals/CreateModal.vue'
import Menu from 'primevue/menu'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    Button,
    OutlayItem,
    CreateModal,
    Menu,
  },
  data() {
    return {
      items: [
        {
          label: 'Клонировать',
          command: () => {},
        },
        {
          label: 'Удалить',
          command: async () => {
            try {
              await this.remove(this.itemToRemove)
            } catch (error) {
              console.log(error)
            } finally {
              this.itemToRemove = null
            }
          },
        },
      ],
      itemToRemove: null,
    }
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
  },
  methods: {
    ...mapActions('outlays', ['create', 'remove']),
    async createOutlay() {
      const response = await this.$refs['create-modal'].show({
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (response) {
        try {
          await this.create(response)
        } catch (error) {
          console.log(error)
        }
      }
    },
    openMenu(e, id) {
      this.itemToRemove = id
      this.$refs.menu.toggle(e)
    },
  },
}
</script>

<template>
  <CreateModal ref="create-modal" />
  <Menu ref="menu" :model="items" :popup="true" />
  <div class="outlay-list">
    <template v-if="outlays && outlays.length > 0">
      <OutlayItem
        v-for="outlay in outlays"
        :key="outlay._id"
        :outlay="outlay"
        @open-menu="openMenu"
      />
    </template>
    <Button
      class="p-button-success"
      icon="pi pi-plus"
      iconPos="right"
      @click="createOutlay"
    />
  </div>
</template>

<style lang="scss" scoped>
.outlay-list {
  display: flex;
  gap: 20px;
  align-items: center;
}
</style>
