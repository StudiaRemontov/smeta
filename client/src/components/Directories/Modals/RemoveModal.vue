<script>
import PopupModal from '../../UI/PopupModal.vue'

const getInitState = () => ({
  title: undefined,
  message: undefined,
  folderName: undefined,
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  keyWord: '',
})

export default {
  components: { PopupModal },
  data() {
    return getInitState()
  },
  computed: {
    isWordCorrect() {
      return this.folderName === this.keyWord
    },
  },
  methods: {
    async show(options) {
      this.title = options.title
      this.message = options.message
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      this.folderName = options.folderName

      this.$refs.popup.open()

      await this.$nextTick()
      this.$refs.input.focus()
      return new Promise((res, rej) => {
        this.resolvePromise = res
        this.rejectPromise = rej
      })
    },
    _confirm() {
      if (!this.isWordCorrect) {
        return
      }
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
      <span class="modal__message">{{ message }}</span>
      <span>
        Чтобы удалить папку введите название папки
        <strong> {{ folderName }} </strong>
      </span>
      <input
        v-model="keyWord"
        class="input"
        ref="input"
        type="text"
        placeholder="Введите название папки"
        @keyup.enter="_confirm"
      />
      <div class="modal__actions">
        <AppButton outlined @click="_cancel">
          {{ cancelButton }}
        </AppButton>
        <AppButton outlined :disabled="!isWordCorrect" @click="_confirm">
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
.input {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}
</style>
