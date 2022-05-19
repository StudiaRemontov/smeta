<script>
import BackIcon from '@/components/UI/Icons/ArrowRight.vue'
import SaveIcon from '@/components/UI/Icons/SaveIcon.vue'
import DownloadIcon from '@/components/UI/Icons/DownloadIcon.vue'
import PrintIcon from '@/components/UI/Icons/PrintIcon.vue'
import { mapActions, mapMutations } from 'vuex'

import DownloadModal from './Modals/DownloadModal.vue'

export default {
  components: { BackIcon, SaveIcon, DownloadIcon, PrintIcon, DownloadModal },
  data() {
    return {
      actions: [
        {
          text: 'Назад',
          handler() {
            console.log(1)
          },
          icon: 'BackIcon',
        },
        {
          text: 'Сохранить',
          handler: () => {
            this.save()
          },
          icon: 'SaveIcon',
        },
        {
          text: 'Скачать',
          handler: () => {
            this.download()
          },
          icon: 'DownloadIcon',
        },
        {
          text: 'Распечатать',
          handler() {
            console.log(1)
          },
          icon: 'PrintIcon',
        },
      ],
    }
  },
  methods: {
    ...mapMutations('outlay', ['setOutlay']),
    ...mapActions('outlay', ['update']),
    async save() {
      this.setOutlay()
      try {
        await this.update()
      } catch (error) {
        console.log(error)
      }
    },
    async download() {
      await this.$refs.download.show({
        okButton: 'Скачать',
        cancelButton: 'Отмена',
      })
    },
  },
}
</script>

<template>
  <DownloadModal ref="download" />
  <div class="action-list">
    <button
      v-for="action in actions"
      class="button action"
      :key="action.text"
      @click="action.handler"
    >
      <component class="action__icon" :is="action.icon" />
      <span class="action__text">{{ action.text }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.action-list {
  background-color: $color-light;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 5px;
  padding: 25px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
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
}
</style>
