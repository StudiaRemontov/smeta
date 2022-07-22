<script>
import ActionList from '@/components/Layout/Outlay/BodyRow/ActionList.vue'
import TabList from './LeftSide/TabList.vue'
import CollapseBlock from './LeftSide/CollapseBlock.vue'

import { actStatus } from '@/enum/actStatus'

import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ActionList,
    TabList,
    CollapseBlock,
  },
  data() {
    return {
      isSaving: false,
      isInConfirmation: false,
    }
  },
  computed: {
    ...mapGetters('acts', ['act']),
    showLeftSide: {
      get() {
        return this.$store.getters['outlay/showLeftSide']
      },
      set(value) {
        return this.setShowLeftSide(value)
      },
    },
    actions() {
      return [
        {
          text: 'Назад',
          handler: () => {
            this.setAct(null)
            this.$router.push('/')
          },
          icon: 'BackIcon',
          disabled: false,
          loading: false,
        },
        {
          text: 'Сохранить',
          handler: () => {
            this.saveHandler()
          },
          icon: 'SaveIcon',
          disabled: this.isSaving,
          loading: this.isSaving,
        },
        {
          text: 'Согласование',
          handler: this.confirm,
          icon: 'ConfirmIcon',
          disabled: this.act.status === actStatus.CONFIRMED,
          loading: this.isInConfirmation,
        },
        {
          text: 'Показать смету',
          handler: () => {
            this.setActiveTab(null)
          },
          icon: 'DocumentIcon',
          disabled: false,
          loading: false,
        },
      ]
    },
  },
  methods: {
    ...mapMutations('outlay', ['setShowLeftSide']),
    ...mapMutations('acts', ['setActiveTab']),
    ...mapActions('acts', ['save', 'setAct', 'update', 'print']),
    async saveHandler() {
      try {
        this.isSaving = true
        await this.save()
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
        this.isSaving = false
      }
    },
    async confirm() {
      this.isInConfirmation = true
      try {
        const data = {
          ...this.act,
          status: actStatus.CONFIRMED,
        }
        await this.update({ id: data._id, data })
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
        this.isInConfirmation = false
      }
    },
  },
}
</script>

<template>
  <div class="wrapper">
    <CollapseBlock v-model="showLeftSide" />
    <ActionList :actions="actions" />
    <TabList />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow: auto;
}
</style>
