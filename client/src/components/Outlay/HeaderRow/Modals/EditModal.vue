<script>
import PopupModal from '@/components/UI/PopupModal.vue'

const getInitState = () => ({
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  name: '',
})

export default {
  components: { PopupModal },
  data() {
    return getInitState()
  },
  methods: {
    async show(options) {
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      this.name = options.name
      this.$refs.popup.open()

      await this.$nextTick()
      this.$refs.input.focus()
      return new Promise((res, rej) => {
        this.resolvePromise = res
        this.rejectPromise = rej
      })
    },
    _confirm() {
      if (!this.name) return
      const data = {
        name: this.name,
      }
      this.$refs.popup.close()
      this.resolvePromise(data)
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
      <span class="modal__title">Создать новую смету</span>
      <form class="form" @submit.prevent="_confirm">
        <div class="form__group">
          <label class="form__label">Название</label>
          <input
            v-model="name"
            placeholder="Название"
            ref="input"
            class="input"
          />
        </div>
      </form>
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
@include modal;

.form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;

  &__group {
    display: flex;
    flex-direction: column;
  }
}
.input {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}
</style>
