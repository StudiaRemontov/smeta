<script>
import { mapActions } from 'vuex'
import PopupModal from '@/components/UI/PopupModal.vue'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  cancelButton: undefined,
  paths: [],
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
    ...mapActions('priceList', ['create']),
    async show(options) {
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      this.paths = options.paths

      this.$refs.popup.open()

      await this.$nextTick()
      this.$refs.input.focus()

      return new Promise(res => {
        this.resolvePromise = res
      })
    },
    async _confirm() {
      await this.createPriceList()
      this.$refs.popup.close()
      this.resolvePromise(true)
      this.reset()
    },
    _cancel() {
      this.$refs.popup.close()
      this.resolvePromise(false)
      this.reset()
    },
    async createPriceList() {
      try {
        await this.create({
          name: this.name,
        })
      } catch (error) {
        console.log(error)
      }
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
      <form @submit.prevent="_confirm">
        <label>Название</label>
        <input v-model="name" ref="input" type="text" />
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
