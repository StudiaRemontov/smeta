<script>
import Button from 'primevue/button'

import OutlayItem from './OutlayItem.vue'
import CreateModal from './Modals/CreateModal.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    Button,
    OutlayItem,
    CreateModal,
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
  },
  methods: {
    ...mapActions('outlays', ['create']),
    selectOutlay() {},
    async createOutlay() {
      const response = await this.$refs['create-modal'].show({
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (response) {
        try {
          const data = await this.create(response)
          console.log(data)
        } catch (error) {
          console.log(error)
        }
      }
    },
  },
}
</script>

<template>
  <CreateModal ref="create-modal" />
  <div class="outlay-list">
    <template v-if="outlays && outlays.length > 0">
      <OutlayItem
        v-for="outlay in outlays"
        :key="outlay._id"
        :outlay="outlay"
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
}
</style>
