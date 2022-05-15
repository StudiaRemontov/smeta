<script>
import PopupModal from '@/components/UI/PopupModal.vue'
import { mapGetters } from 'vuex'

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
  computed: {
    ...mapGetters('outlay', ['outlay']),
  },
  methods: {
    show() {
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

    reset() {
      Object.assign(this.$data, getInitState())
    },
  },
}
</script>

<template>
  <PopupModal ref="popup">
    <div class="modal">
      <span class="modal__title">Информация</span>
      <span> Объект: .... </span>
      <div class="modal__actions">
        <AppButton outlined @click="_confirm"> Закрыть </AppButton>
      </div>
    </div>
  </PopupModal>
</template>

<style lang="scss" scoped>
@include modal;
</style>
