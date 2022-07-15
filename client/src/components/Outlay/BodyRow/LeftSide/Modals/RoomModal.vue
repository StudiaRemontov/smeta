<script>
import PopupModal from '@/components/UI/PopupModal.vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'

import roomParameters from '@/mixins/roomParameters.mixin'
import keyTypes from '@/mixins/keyTypes.mixin'
import { mapGetters } from 'vuex'
import directoryNames from '@/enum/directoryNames'

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
  roomTypes: [],
  room: null,
  invalid: false,
})

export default {
  components: { PopupModal, InputNumber, InputText, Dropdown },
  mixins: [roomParameters, keyTypes],
  data() {
    return getInitState()
  },
  computed: {
    ...mapGetters('outlay', ['selectedRoom', 'rooms', 'edition']),
    ...mapGetters('directory', ['directories', 'roomDirectory']),
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
      if (!this.name || this.invalid) {
        return false
      }
      if (this.room && !this.room.parameters) {
        return true
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
      const firstRoomWithParameters = this.rooms.find(r => r.options)
      if (!firstRoomWithParameters) {
        return placeholders
      }
      const { options } = firstRoomWithParameters
      return Object.assign(placeholders, options)
    },
    showParameters() {
      return (this.name && !this.room) || (this.room && this.room.parameters)
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
    getRoomsFromDirectory() {
      const directory = this.directories.find(
        d => d.name === directoryNames.ROOMS,
      )
      if (!directory) {
        console.warn(
          'Справочника с комнатами либо не существует, либо указано неверное название справочника',
        )
        return []
      }
      const { values, keys } = directory
      const roomKeys = keys.reduce((acc, key) => {
        const { type } = key
        if (type === this.InputType.STRING) {
          acc.name = key.id
        }
        if (type === this.InputType.BOOLEAN_ROOM_COMPUTED) {
          acc.computed = key.id
        }
        if (type === this.InputType.BOOLEAN_ROOM_PARAMETERS) {
          acc.parameters = key.id
        }
        return acc
      }, {})
      const existingRooms = values.filter(r => !r.removed)
      const rooms = existingRooms.map(value => {
        const { data, id } = value
        return {
          roomId: id,
          name: data[roomKeys.name],
          computed: data[roomKeys.computed],
          parameters: data[roomKeys.parameters],
        }
      })
      return rooms
    },
    async show(options) {
      const rooms = this.getRoomsFromDirectory()
      this.roomTypes = rooms
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      if (options.edit) {
        const { dirId, name } = this.selectedRoom
        this.room = dirId && this.roomTypes.find(r => r.roomId === dirId)
        this.name = name
        if (this.selectedRoom.options) {
          this.width = this.selectedRoom.options.width
          this.height = this.selectedRoom.options.height
          this.length = this.selectedRoom.options.length
          this.spaces = this.selectedRoom.options.spaces
        }
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
    capitalizeName(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    _confirm() {
      if (!this.isCorrectFields) {
        return
      }
      this.$refs.popup.close()
      const dirId = this.room && this.room.roomId
      const name = this.capitalizeName(this.name)
      const options =
        (this.room && this.room.parameters) || !this.room
          ? {
              width: this.width || '0',
              height: this.height || '0',
              length: this.length || '0',
              spaces: this.spaces || '0',
            }
          : null

      const data = {
        name,
        options,
        dirId,
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
    getAllCategories(node) {
      const { children } = node
      if (children && children.length > 0) {
        const childs = children.map(this.getAllCategories).flat()
        return [node.key, ...childs]
      }
      return []
    },
    changeRoom(e) {
      const { value: room } = e
      const { name } = room
      this.name = name
      const { values: rooms, keys } = this.roomDirectory
      const directoryRoom = rooms.find(r => r.id === room.roomId)
      if (!directoryRoom) {
        return console.warn('данной комнаты в справочнике не существует')
      }
      const { data } = directoryRoom

      const collectionKey = keys.find(k => k.type === this.InputType.COLLECTION)
      if (!collectionKey) {
        return console.warn(
          'В справочнике комнат нету колонки с набором справочников',
        )
      }
      const roomCollections = data[collectionKey.id]
      if (!roomCollections) {
        return console.warn(
          'В данной комнете нету справочников, обратитесь к администратору',
        )
      }
      const editionClone = JSON.parse(JSON.stringify(this.edition))
      const { data: root } = editionClone
      const rootCollections = root.children.map(this.getAllCategories).flat()
      const isValid = roomCollections.every(
        r => rootCollections.indexOf(r) >= 0,
      )
      if (!isValid) {
        this.invalid = true
        return this.$toast.add({
          severity: 'warn',
          summary: 'Несоответствие работ комнаты и редакции',
          detail: 'Обратитесь к администратору',
          life: 3000,
        })
      }
      this.invalid = false
    },
    inputRoom() {
      this.invalid = false
    },
  },
}
</script>

<template>
  <PopupModal ref="popup">
    <div class="modal">
      <span class="modal__title">{{ title }}</span>
      <form class="form" @submit.prevent="_confirm">
        <div class="form__flex">
          <div class="form__group">
            <label class="form__label">Тип помещения</label>
            <Dropdown
              v-model="room"
              :options="roomTypes"
              optionLabel="name"
              ref="input"
              :filter="true"
              placeholder="Выберите помещение или введите название"
              emptyMessage="Помещение не найдено"
              dataKey="roomId"
              filterPlaceholder="Поиск"
              @change="changeRoom"
              @input="inputRoom"
            />
          </div>
          <div class="form__group">
            <label class="form__label">Название</label>
            <InputText v-model.trim="name" placeholder="Название помещения" />
          </div>
        </div>
        <template v-if="showParameters">
          <span>Параметры помещения</span>
          <div class="form__grid">
            <div class="form__group">
              <label class="form__label">Длина</label>
              <input
                v-model="length"
                class="input"
                type="text"
                @input="inputHandler($event, 'length')"
              />
            </div>
            <div class="form__group">
              <label class="form__label">Ширина</label>
              <input
                v-model="width"
                class="input"
                type="text"
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
        </template>
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

  &__flex {
    display: flex;
    gap: 10px;
  }

  &__flex &__group {
    flex: 1;
  }
}
.input,
.select {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}
</style>
