<script>
import PopupModal from '@/components/UI/PopupModal.vue'
import { mapGetters } from 'vuex'

const getInitState = () => ({
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  name: '',
  priceList: null,
})

export default {
  components: { PopupModal },
  data() {
    return getInitState()
  },
  computed: {
    ...mapGetters('priceList', ['priceLists']),
    ...mapGetters('edition', ['editions']),
    priceListOptions() {
      return this.priceLists.map(p => ({
        label: p.name,
        value: p,
      }))
    },
  },
  methods: {
    async show(options) {
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      if (this.priceListOptions.length > 0) {
        this.priceList = this.priceLists[0]
      }
      this.$refs.popup.open()

      await this.$nextTick()
      this.$refs.input.focus()
      return new Promise((res, rej) => {
        this.resolvePromise = res
        this.rejectPromise = rej
      })
    },
    _confirm() {
      if (!this.priceList || !this.name) return
      const activeEdition = this.priceList.editions.find(editionId => {
        const foundEdition = this.editions.find(e => e._id === editionId)
        if (!foundEdition) return false
        return foundEdition.active === true
      })

      const data = {
        name: this.name,
        edition: activeEdition,
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
        <div class="form__group">
          <label>Прайс лист</label>
          <select v-model="priceList" class="select">
            <option
              v-for="option in priceListOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
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
.input,
.select {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}
</style>
