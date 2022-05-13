<script>
import PopupModal from '@/components/UI/PopupModal.vue'
const getInitState = () => ({
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
    show(options) {
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      this.$refs.popup.open()

      return new Promise((res, rej) => {
        this.resolvePromise = res
        this.rejectPromise = rej
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
      <span class="modal__title"> Скачать </span>
      <div class="modal__actions">
        <AppButton outlined @click="_cancel"> Отмена </AppButton>
        <AppButton outlined @click="_confirm"> Скачать </AppButton>
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
