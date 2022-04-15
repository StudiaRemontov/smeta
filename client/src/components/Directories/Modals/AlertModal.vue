<script>
import PopupModal from '../../UI/PopupModal.vue'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  directories: null,
  priceList: null,
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
      this.title = options.title
      this.okButton = options.okButton
      this.directories = options.directories
      this.priceList = options.priceList
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
      <template v-if="priceList">
        <span>
          Данный справочник используется в прайс листе
          <strong>{{ priceList }}</strong>
        </span>
      </template>
      <template v-else-if="directories">
        <span> Справочник используется в следующих архитектурах: </span>
        <ul>
          <li v-for="directory in directories" :key="directory">
            <strong>
              {{ directory }}
            </strong>
          </li>
        </ul>
      </template>

      <div class="modal__actions">
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
