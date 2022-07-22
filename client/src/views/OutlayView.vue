<script>
import { computed } from 'vue'
import BodyRow from '@/components/Layout/Outlay/BodyRow.vue'

import OutlayLayout from '@/components/Layout/OutlayLayout.vue'
import HeaderRow from '@/components/Layout/Outlay/HeaderRow.vue'

import OutlayList from '@/components/Outlay/HeaderRow/OutlayList.vue'

import LeftSide from '@/components/Outlay/BodyRow/LeftSide.vue'
import RightSide from '@/components/Outlay/BodyRow/RightSide.vue'
import CenterSide from '@/components/Outlay/BodyRow/CenterSide.vue'

import CreateModal from '@/components/Outlay/HeaderRow/CenterSide/Modals/CreateModal.vue'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    OutlayLayout,
    HeaderRow,
    OutlayList,
    CreateModal,
    BodyRow,
    LeftSide,
    RightSide,
    CenterSide,
  },
  provide() {
    return {
      objectData: computed(() => this.objectData),
    }
  },
  data() {
    return {
      interval: null,
      objectData: {
        id: 70000,
        user: 'Сергей Алексеевич',
      },
      loading: true,
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'invalidJobs',
      'outlay',
      'selectedRoom',
      'showLeftSide',
      'showRightSide',
    ]),
    ...mapGetters(['isOffline']),
    invalidNodes() {
      const values = Object.values(this.invalidJobs)
      return values.some(v => v.length > 0)
    },
    isActionsDisabled() {
      const values = Object.values(this.invalidJobs)
      const isValid = values.every(v => v.length === 0)
      return !isValid
    },
  },
  watch: {
    outlay() {
      this.interval = clearInterval(this.interval)
      this.interval = setInterval(this.save, 1000 * 60)
    },
  },
  async mounted() {
    this.loading = true
    await this.setOutlay(null)
    this.interval = setInterval(this.save, 1000 * 60)
    this.loading = false
  },
  unmounted() {
    clearInterval(this.interval)
    this.setOutlay(null)
  },
  methods: {
    ...mapActions('outlay', ['setOutlay', 'saveLocaly', 'update']),
    ...mapActions('outlays', ['create']),
    async createOutlay() {
      const response = await this.$refs['create-modal'].show({
        okButton: 'Создать',
        cancelButton: 'Отмена',
      })
      if (response) {
        try {
          await this.create(response)
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
      }
    },
    async save() {
      if (!this.isOffline) {
        await this.update()
        await this.saveLocaly()
      }
    },
  },
}
</script>

<template>
  <OutlayLayout>
    <template #header>
      <CreateModal ref="create-modal" />
      <HeaderRow>
        <button
          class="button create"
          :disabled="invalidNodes"
          @click="createOutlay"
        >
          <i class="pi pi-plus create__icon" />
        </button>
        <OutlayList />
      </HeaderRow>
    </template>
    <template #body>
      <BodyRow
        v-if="outlay"
        :showLeftSide="showLeftSide"
        :showRightSide="showRightSide"
      >
        <template #left-side>
          <LeftSide />
        </template>
        <template #center>
          <CenterSide />
        </template>
        <template #right-side>
          <RightSide />
        </template>
      </BodyRow>
    </template>
  </OutlayLayout>
</template>

<style lang="scss" scoped>
.create {
  background: $color-success;
  border: 1px solid $color-success;
  border-radius: 10px;
  padding: 9px 15px;
  width: 41px;
  justify-content: center;

  &__icon {
    color: #fff;
  }
}
</style>
