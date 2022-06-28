<script>
import BackIcon from '@/components/UI/Icons/ArrowRight.vue'
import SaveIcon from '@/components/UI/Icons/SaveIcon.vue'
import DownloadIcon from '@/components/UI/Icons/DownloadIcon.vue'
import PrintIcon from '@/components/UI/Icons/PrintIcon.vue'
import ConfirmIcon from '@/components/UI/Icons/ConfirmIcon.vue'
import PrintPage from '@/components/PrintAct/PrintPage.vue'

import { mapActions, mapGetters } from 'vuex'

import OutlayBlock from '@/components/Layout/OutlayBlock.vue'

import { actStatus } from '../../../../enum/actStatus'
import { downloadFile } from '../../../../helpers/downloadFile'

export default {
  components: {
    BackIcon,
    SaveIcon,
    DownloadIcon,
    PrintIcon,
    PrintPage,
    OutlayBlock,
    ConfirmIcon,
  },
  data() {
    return {
      isSaving: false,
      isInConfirmation: false,
      isDownloading: false,
      isPrinting: false,
    }
  },
  computed: {
    ...mapGetters('outlay', ['outlay']),
    ...mapGetters('acts', ['act']),
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
          text: 'Скачать',
          handler: this.download,
          icon: 'DownloadIcon',
          disabled:
            this.isDownloading || this.act.status !== actStatus.CONFIRMED,
          loading: this.isDownloading,
        },
        {
          text: 'Распечатать',
          handler: this.printHandler,
          icon: 'PrintIcon',
          disabled: this.isPrinting,
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
    async download() {
      if (!this.act) {
        return
      }
      this.isDownloading = true
      try {
        await this.save()
        await this.print(this.act._id)
        await downloadFile('act', this.act.name)
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
    <Teleport to="#act-print">
      <PrintPage v-if="act && isPrinting" :act="act" @mounted="readyForPrint" />
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
