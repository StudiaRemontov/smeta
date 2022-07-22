<script>
import ActionList from '@/components/Layout/Outlay/BodyRow/ActionList.vue'
import TabList from './LeftSide/TabList.vue'
import CollapseBlock from '../../Act/BodyRow/LeftSide/CollapseBlock.vue'
import { mapActions, mapMutations } from 'vuex'

export default {
  components: {
    CollapseBlock,
    ActionList,
    TabList,
  },
  data() {
    return {
      isDownloading: false,
      isSaving: false,
      isPrinting: false,
    }
  },
  computed: {
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
            this.setOutlay(null)
            this.$router.push('/')
          },
          icon: 'BackIcon',
          disabled: false,
          loading: false,
        },
        {
          text: 'Сохранить',
          handler: () => {
            this.save()
          },
          icon: 'SaveIcon',
          disabled: this.isSaving,
          loading: this.isSaving,
        },
      ]
    },
  },
  methods: {
    ...mapMutations('outlay', [
      'setShowLeftSide',
      'setShowResults',
      'setSelectedRoom',
    ]),
    ...mapMutations('outlay', {
      prepareOutlay: 'setOutlay',
    }),
    ...mapActions('outlay', ['update', 'setOutlay']),
    async save() {
      this.isSaving = true
      this.prepareOutlay()
      try {
        await this.update()
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
