<script>
import PopupModal from '../../UI/PopupModal.vue'
import keyTypes from '@/mixins/keyTypes.mixin'
import { mapGetters } from 'vuex'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  name: '',
  type: 'string',
  options: '',
})

export default {
  components: { PopupModal },
  mixins: [keyTypes],
  data() {
    return getInitState()
  },
  computed: {
    ...mapGetters('directory', ['directories']),
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
      this.resolvePromise({
        id: Date.now(),
        name: this.name,
        type: this.type,
      })
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
          <label class="form__label">Тип</label>
          <select v-model="type" class="select">
            <option
              v-for="option in types"
              class="select__option"
              :key="option"
              :value="option"
            >
              {{ option }}
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
