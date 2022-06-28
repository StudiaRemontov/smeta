<script>
import BackIcon from '@/components/UI/Icons/ArrowRight.vue'
import SaveIcon from '@/components/UI/Icons/SaveIcon.vue'
import DownloadIcon from '@/components/UI/Icons/DownloadIcon.vue'
import PrintIcon from '@/components/UI/Icons/PrintIcon.vue'
import PrintPage from '@/components/Print/PrintPage.vue'

import { mapActions, mapGetters, mapMutations } from 'vuex'

import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

import { downloadFile } from '../../../../helpers/downloadFile'

export default {
  components: {
    BackIcon,
    SaveIcon,
    DownloadIcon,
    PrintIcon,
    PrintPage,
    OutlayBlock,
  },
  data() {
    return {
      isDownloading: false,
      isSaving: false,
      isPrinting: false,
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay', 'invalidJobs', 'selectedRoom']),
    isActionsDisabled() {
      const values = Object.values(this.invalidJobs)
      const isValid = values.every(v => v.length === 0)
      return !isValid
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
          disabled: this.isSaving || this.isActionsDisabled,
          loading: this.isSaving,
        },
        {
          text: 'Скачать',
          handler: () => {
            this.download()
          },
          icon: 'DownloadIcon',
          disabled: this.isDownloading || this.isActionsDisabled,
          loading: this.isDownloading,
        },
        {
          text: 'Распечатать',
          handler: this.printHandler,
          icon: 'PrintIcon',
          disabled: this.isPrinting || this.isActionsDisabled,
          loading: false,
        },
      ]
    },
  },
  mounted() {
    window.addEventListener('afterprint', this.afterPrint)
    window.addEventListener('keydown', this.keydownHandler)
  },
  unmounted() {
    window.removeEventListener('afterprint', this.afterPrint)
    window.removeEventListener('keydown', this.keydownHandler)
  },
  methods: {
    ...mapMutations('outlay', {
      prepareOutlay: 'setOutlay',
    }),
    ...mapActions('outlay', ['update', 'setOutlay']),
    ...mapActions('outlays', ['print']),
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
    async download() {
      if (!this.outlay) {
        return console.error('select outlay')
      }
      this.isDownloading = true
      try {
        await this.update()
        await this.print(this.outlay._id)
        await downloadFile('smeta', this.outlay.name)
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
        this.isDownloading = false
      }
    },
    keydownHandler(e) {
      const { ctrlKey, code } = e
      if (!ctrlKey || code !== 'KeyP') {
        return
      }
      e.preventDefault()
      this.printHandler()
    },
    async printHandler() {
      await this.$nextTick()
      this.isPrinting = true
    },
    afterPrint() {
      this.isPrinting = false
    },
    readyForPrint() {
      window.print()
    },
  },
}
</script>

<template>
  <OutlayBlock>
    <div class="action-list">
      <button
        v-for="action in actions"
        class="button action"
        :key="action.text"
        :disabled="action.disabled"
        @click="action.handler"
      >
        <component class="action__icon" :is="action.icon" />
        <span class="action__text">{{ action.text }}</span>
        <i v-if="action.loading" class="pi pi-spin pi-spinner"></i>
      </button>
    </div>
    <Teleport to="#print">
      <PrintPage
        v-if="outlay && isPrinting"
        :outlay="outlay"
        @mounted="readyForPrint"
      />
    </Teleport>
  </OutlayBlock>
</template>

<style lang="scss" scoped>
.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action {
  border: 1px solid #545454;
  border-radius: 10px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 15px;

  &__icon {
    width: 15px;
    height: 15px;
  }

  &:disabled &__icon {
    opacity: 0.5;
  }
}
</style>
