<script>
import { computed } from 'vue'

import OutlayLayout from '@/components/Layout/OutlayLayout.vue'
import HeaderRow from '@/components/Layout/Outlay/HeaderRow.vue'
import BodyRow from '@/components/Layout/Outlay/BodyRow.vue'

import LeftSide from '@/components/Act/BodyRow/LeftSide.vue'
import RightSide from '@/components/Act/BodyRow/RightSide.vue'
import CenterSide from '@/components/Act/BodyRow/CenterSide.vue'

import ActList from '@/components/Act/HeaderRow/CenterSide/ActList.vue'

import { actStatus } from '@/enum/actStatus'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    OutlayLayout,
    HeaderRow,
    BodyRow,
    ActList,
    LeftSide,
    CenterSide,
    RightSide,
  },
  provide() {
    return {
      objectData: computed(() => this.objectData),
    }
  },
  data() {
    return {
      loading: true,
      objectData: {
        id: 70000,
        user: 'Сергей Алексеевич',
      },
    }
  },
  computed: {
    ...mapGetters('acts', ['acts', 'act']),
    ...mapGetters('outlay', ['outlay', 'showLeftSide', 'showRightSide']),
    ...mapGetters('outlays', ['outlays']),
    id() {
      return this.$route.params.id
    },
  },
  async mounted() {
    if (!this.id) {
      return
    }
    try {
      await this.fetchAll()
      const outlay = this.outlays.find(o => o._id === this.id)
      if (!outlay) {
        return
      }
      await this.prepateOutlay(outlay)
      this.setOutlay(outlay)
    } catch (error) {
      console.log(error)
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions('acts', ['create', 'fetchAll', 'setOutlay']),
    ...mapActions('outlay', {
      prepateOutlay: 'setOutlay',
    }),
    canCreate() {
      const lastAct = this.acts[this.acts.length - 1]
      if (!lastAct) {
        return true
      }
      const { status } = lastAct

      return status === actStatus.CONFIRMED
    },
    async createAct() {
      const canCreate = this.canCreate()
      if (!canCreate) {
        return this.$toast.add({
          severity: 'warn',
          detail: 'Предыдущий акт должен быть согласован',
          life: 3000,
        })
      }
      try {
        await this.create()
      } catch (error) {
        console.log(error)
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
  },
}
</script>

<template>
  <OutlayLayout>
    <template #header>
      <HeaderRow>
        <button class="button create" @click="createAct">
          <i class="pi pi-plus create__icon" />
        </button>
        <ActList />
      </HeaderRow>
    </template>
    <template #body>
      <BodyRow
        v-if="act && !loading"
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
