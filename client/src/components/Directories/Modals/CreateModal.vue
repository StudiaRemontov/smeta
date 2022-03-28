<script>
import PopupModal from '../../UI/PopupModal.vue'

export default {
  components: { PopupModal },
  data() {
    return {
      title: undefined,
      okButton: undefined,
      cancelButton: undefined,
      resolvePromise: undefined,
      rejectPromise: undefined,
      name: '',
    }
  },
  methods: {
    async show(options) {
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton

      this.$refs.popup.open()

      await this.$nextTick()
      this.$refs.input.focus()
      return new Promise((res, rej) => {
        this.resolvePromise = res
        this.rejectPromise = rej
      })
    },
    _confirm() {
      this.$refs.popup.close()
      this.resolvePromise(this.name)
    },

    _cancel() {
      this.$refs.popup.close()
      this.resolvePromise(false)
    },
  },
}
</script>

<template>
  <PopupModal ref="popup">
    <div class="modal">
      <span class="confirm-title">{{ title }}</span>
      <form class="form" @submit.prevent="_confirm">
        <AppInput v-model="name" ref="input" class="input" />
      </form>
      <div class="confirm-actions">
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
.form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.input {
  border: 1px solid #a7a7a7;
  padding: 10px;
}
</style>
