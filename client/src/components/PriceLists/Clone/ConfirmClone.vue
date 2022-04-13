<script>
import { mapActions } from 'vuex'
import PopupModal from '@/components/UI/PopupModal.vue'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
})

export default {
  components: { PopupModal },
  data() {
    return getInitState()
  },
  methods: {
    ...mapActions('priceList', ['create']),
    show(options) {
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton

      this.$refs.popup.open()

      return new Promise(res => {
        this.resolvePromise = res
      })
    },
    _confirm() {
      this.$refs.popup.close()
      this.resolvePromise(true)
      this.reset()
    },
    _cancel() {
      this.$refs.popup.close()
      this.resolvePromise(false)
      this.reset()
    },
    reset() {
      Object.assign(this.$data, getInitState())
    },
  },
}
</script>

<template>
  <PopupModal ref="popup">
    <div class="modal">
      <span class="modal__title">{{ title }}</span>
      <span> Данные справочника и редакции отличаются. </span>
      <span>Применить изменения справочника?</span>
      <div class="modal__actions">
        <AppButton outlined @click="_cancel">
          {{ cancelButton }}
        </AppButton>
        <AppButton outlined @click="_confirm">
          {{ okButton }}
        </AppButton>
      </div>
    </div>
  </PopupModal>
</template>

<style lang="scss" scoped>
.modal {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;

  &__title {
    font-weight: 700;
    font-size: $font-medium;
  }

  &__actions {
    align-self: flex-end;
    gap: 10px;
  }
}
</style>
