<script>
import PopupModal from '@/components/UI/PopupModal.vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'

import mathExp from 'math-expression-evaluator'

import { mapGetters } from 'vuex'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  formData: {
    name: '',
    width: null,
    height: null,
    length: null,
    spaces: null,
  },
})

export default {
  components: { PopupModal, InputText, InputNumber },
  data() {
    return getInitState()
  },
  computed: {
    ...mapGetters('outlay', ['selectedRoom']),
    perimeter() {
      if (!this.formData.width || !this.formData.length) return 0
      return (this.formData.width + this.formData.length) * 2
    },
    floorArea() {
      if (!this.formData.width || !this.formData.length) return 0
      return this.formData.width * this.formData.length
    },
    spacesResult() {
      if (!this.formData.spaces) return 0
      try {
        return mathExp.eval(this.formData.spaces)
      } catch (error) {
        return 0
      }
    },
    wallArea() {
      if (!this.perimeter || !this.formData.height) return 0
      return this.perimeter * this.formData.height - this.spacesResult
    },
    isCorrectFields() {
      return Object.entries(this.formData).every(([key, value]) => {
        if (key === 'spaces') {
          return true
        }
        if (!value) {
          return false
        }
        return true
      })
    },
  },
  methods: {
    async show(options) {
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      if (options.edit) {
        this.formData.name = this.selectedRoom.name
        this.formData.width = this.selectedRoom.options.width
        this.formData.height = this.selectedRoom.options.height
        this.formData.length = this.selectedRoom.options.length
        this.formData.spaces = this.selectedRoom.options.spaces
      }
      this.$refs.popup.open()

      await this.$nextTick()
      this.$refs.input.$el.focus()
      return new Promise((res, rej) => {
        this.resolvePromise = res
        this.rejectPromise = rej
      })
    },
    _confirm() {
      if (!this.isCorrectFields) {
        return
      }
      this.$refs.popup.close()

      const data = {
        name: this.formData.name,
        options: {
          width: this.formData.width || 0,
          height: this.formData.height || 0,
          length: this.formData.length || 0,
          spaces: this.formData.spaces || 0,
        },
      }
      this.resolvePromise(data)
      this.reset()
    },

    _cancel() {
      this.$refs.popup.close()
      this.resolvePromise(false)
      this.reset()
    },

    _remove() {
      this.$refs.popup.close()
      this.resolvePromise({ remove: true })
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
          <InputText
            v-model="formData.name"
            placeholder="Название"
            ref="input"
          />
        </div>
        <span>Параметры комнаты</span>
        <div class="form__grid">
          <div class="form__group">
            <label class="form__label">Длина</label>
            <InputNumber v-model="formData.length" placeholder="Длина" />
          </div>
          <div class="form__group">
            <label class="form__label">Ширина</label>
            <InputNumber v-model="formData.width" placeholder="Ширина" />
          </div>
          <div class="form__group">
            <label class="form__label">Высота</label>
            <InputNumber v-model="formData.height" placeholder="Высота" />
          </div>
          <div class="form__group">
            <label class="form__label">Проемы</label>
            <InputText v-model="formData.spaces" placeholder="Проемы" />
          </div>
        </div>
        <span>Вычисляемые свойства</span>
        <div class="form__grid">
          <div class="form__group">
            <label class="form__label">Периметр</label>
            <InputNumber
              v-model="perimeter"
              placeholder="Периметер"
              :disabled="true"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Площадь пола</label>
            <InputNumber
              v-model="floorArea"
              placeholder="Площадь пола"
              :disabled="true"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Площадь стен</label>
            <InputNumber
              v-model="wallArea"
              placeholder="Площадь стен"
              :disabled="true"
            />
          </div>
        </div>
      </form>
      <div class="modal__actions">
        <AppButton outlined @click="_cancel">
          {{ cancelButton }}
        </AppButton>
        <AppButton outlined :disabled="!isCorrectFields" @click="_confirm">
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

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
  }
}
.input,
.select {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}
</style>
