<script>
import PopupModal from '@/components/UI/PopupModal.vue'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'

import roomParameters from '@/mixins/roomParameters.mixin'
import { mapGetters } from 'vuex'
import { roomNames } from '@/enum/roomNames'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  name: '',
  length: null,
  width: null,
  height: null,
  spaces: null,
  formDataBefore: {
    width: null,
    height: null,
    length: null,
    spaces: null,
  },
  roomTypes: roomNames,
})

export default {
  components: { PopupModal, InputNumber, Dropdown },
  mixins: [roomParameters],
  data() {
    return getInitState()
  },
  computed: {
    ...mapGetters('outlay', ['selectedRoom', 'rooms']),
    calculatedWidth() {
      return this.calculate(this.width)
    },
    calculatedLength() {
      return this.calculate(this.length)
    },
    calculatedHeight() {
      return this.calculate(this.height)
    },
    calculatedSpaces() {
      return this.calculate(this.spaces)
    },
    perimeter() {
      if (!this.calculatedWidth || !this.calculatedLength) return 0
      return this.getPerimeter(this.calculatedWidth, this.calculatedLength)
    },
    floorArea() {
      if (!this.calculatedWidth || !this.calculatedLength) return 0
      return this.getFloorArea(this.calculatedWidth, this.calculatedLength)
    },
    wallArea() {
      if (!this.perimeter || !this.calculatedHeight) return 0
      return this.getWallArea(
        this.perimeter,
        this.calculatedHeight,
        this.calculatedSpaces,
      )
    },
    isCorrectFields() {
      if (!this.name) {
        return false
      }

      return (
        this.isCorrectField(this.calculatedWidth) &&
        this.isCorrectField(this.calculatedLength) &&
        this.isCorrectField(this.calculatedHeight)
      )
    },
    placeholders() {
      const placeholders = {
        width: null,
        height: null,
        length: null,
        spaces: null,
      }
      const firstRoom = this.rooms[0]
      if (!firstRoom) {
        return placeholders
      }
      const { options } = firstRoom
      return Object.assign(placeholders, options)
    },
  },
  watch: {
    length(_, old) {
      this.formDataBefore.length = old
    },
    height(_, old) {
      this.formDataBefore.height = old
    },
    width(_, old) {
      this.formDataBefore.width = old
    },
  },
  methods: {
    async show(options) {
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      if (options.edit) {
        this.name = this.selectedRoom.name
        this.width = this.selectedRoom.options.width
        this.height = this.selectedRoom.options.height
        this.length = this.selectedRoom.options.length
        this.spaces = this.selectedRoom.options.spaces
      }
      this.$refs.popup.open()

      await this.$nextTick()
      const { input } = this.$refs
      const inputEl = input.$el.querySelector('input')
      if (inputEl) {
        inputEl.focus()
      }
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
        name: this.name,
        options: {
          width: this.width || '0',
          height: this.height || '0',
          length: this.length || '0',
          spaces: this.spaces || '0',
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
    inputHandler(e, key) {
      const regex = /^[0-9+-/*.,]*$/
      const isValid = regex.test(this[key])
      if (!isValid) {
        return (this[key] = this.formDataBefore[key])
      }
      const { data } = e
      if (data === ',') {
        this[key] = this[key].replace(',', '.')
      }
      const numberRegex = /[-]?\d+(\.\d+)?/g
      const matches = this[key].match(numberRegex)
      if (!matches) {
        return
      }
      matches.forEach(n => {
        const num = +n
        if (num > 0) {
          this[key] = this[key].replace(n, num)
        }
      })
    },
    isCorrectField(field) {
      return !isNaN(field) && field > 0
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
          <Dropdown
            v-model.trim="name"
            :options="roomTypes"
            :editable="true"
            ref="input"
          />
        </div>
        <span>Параметры помещения</span>
        <div class="form__grid">
          <div class="form__group">
            <label class="form__label">Длина</label>
            <input
              v-model="length"
              class="input"
              type="text"
              :placeholder="placeholders['length']"
              @input="inputHandler($event, 'length')"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Ширина</label>
            <input
              v-model="width"
              class="input"
              type="text"
              :placeholder="placeholders['width']"
              @input="inputHandler($event, 'width')"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Высота</label>
            <input
              v-model="height"
              class="input"
              type="text"
              :placeholder="placeholders['height']"
              @input="inputHandler($event, 'height')"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Проемы</label>
            <input
              v-model="spaces"
              class="input"
              type="text"
              :placeholder="placeholders['spaces']"
              @input="inputHandler($event, 'spaces')"
            />
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
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Площадь пола</label>
            <InputNumber
              v-model="floorArea"
              placeholder="Площадь пола"
              :disabled="true"
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Площадь стен</label>
            <InputNumber
              v-model="wallArea"
              placeholder="Площадь стен"
              :disabled="true"
              :minFractionDigits="2"
              :maxFractionDigits="2"
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
