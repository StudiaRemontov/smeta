<script>
import PopupModal from '@/components/UI/PopupModal.vue'
import InputText from 'primevue/inputtext'
import ToggleButton from 'primevue/togglebutton'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'

import ListItems from './RoomModal/ListItems.vue'
import InputNumber from './RoomModal/InputNumber.vue'
import CalculatedParameters from './RoomModal/CalculatedParameters.vue'

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
  optionRooms: [],
  invalid: false,
  editName: false,
  dors: [],
  windows: [],
})

export default {
  components: {
    PopupModal,
    InputText,
    Dropdown,
    ToggleButton,
    MultiSelect,
    ListItems,
    InputNumber,
    CalculatedParameters,
  },
  mixins: [roomParameters, keyTypes],
  provide() {
    return {
      updateItem: this.updateItem,
      removeItem: this.removeItem,
    }
  },
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
      //calc with dors and windows
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
    calculatedParameters() {
      if (this.isSpecMontage) {
        return this.optionRooms.reduce((acc, roomId) => {
          const room = this.rooms.find(r => r.id === roomId)
          const { options } = room
          const { computed } = this.calculateAllParameters(options)
          const data = {
            [this.roomOptions.perimeter]: computed[this.roomOptions.perimeter],
            [this.roomOptions.floorArea]: computed[this.roomOptions.floorArea],
            [this.roomOptions.wallArea]: computed[this.roomOptions.wallArea],
          }
          return this.sumParameters(acc, data)
        }, {})
      }

      return {
        [this.roomOptions.perimeter]: this.perimeter,
        [this.roomOptions.floorArea]: this.floorArea,
        [this.roomOptions.wallArea]: this.wallArea,
      }
    },
    isValidDorsAndWindows() {
      const validDors = this.checkSpaces(this.dors)
      const validWindows = this.checkSpaces(this.windows)
      return validDors && validWindows
    },
    isCorrectFields() {
      if (!this.name || this.invalid || !this.room) {
        return false
      }
      if (!this.room.parameters) {
        return true
      }

      if (this.isSpecMontage) {
        return this.optionRooms.length > 0
      }

      const correctFiles =
        this.isCorrectField(this.calculatedWidth) &&
        this.isCorrectField(this.calculatedLength) &&
        this.isCorrectField(this.calculatedHeight)

      return correctFiles && this.isValidDorsAndWindows
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
    isSpecMontage() {
      if (!this.room || !this.room.roomId) {
        return false
      }
      const loweredName = this.room.name.toLowerCase()
      return loweredName === 'спецмонтаж'
    },
    showParameters() {
      if (this.isSpecMontage) {
        return false
      }
      return this.room && (!this.room.roomId || this.room.parameters)
    },
    specRooms() {
      if (!this.isSpecMontage) {
        return []
      }
      return this.rooms.filter(room => {
        const { dirId } = room
        if (!dirId) {
          return true
        }
        const roomData = this.roomTypes.find(r => r.roomId === dirId)
        if (!roomData) {
          return false
        }
        const { parameters, computed } = roomData
        return parameters && computed
      })
    },
    label() {
      return this.editName ? 'Название помещения' : 'Тип помещения'
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
    checkSpaces(items) {
      if (!items || !items?.length) {
        return true
      }
      return items.every(item => {
        const { width, height } = item
        const calculatedWidth = this.calculate(width)
        const calculatedHeight = this.calculate(height)
        return calculatedWidth && calculatedHeight
      })
    },
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
      const customRoomOption = {
        roomId: null,
        name: 'Своя комната',
        computed: true,
        parameters: true,
      }
      this.roomTypes = [customRoomOption, ...rooms]
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      if (options.edit) {
        const { dirId, name } = this.selectedRoom
        this.room = this.roomTypes.find(r => r.roomId === dirId)
        this.name = name
        if (this.selectedRoom.options && !this.selectedRoom.options.rooms) {
          this.width = this.selectedRoom.options.width
          this.height = this.selectedRoom.options.height
          this.length = this.selectedRoom.options.length
          const { others, dors, windows } = this.selectedRoom.options.spaces
          this.spaces = others
          this.dors = dors
          this.windows = windows
        }
        if (this.selectedRoom.options.rooms) {
          this.optionRooms = this.selectedRoom.options.rooms
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

      if (this.isSpecMontage) {
        this.resolvePromise({
          name,
          options: {
            rooms: this.optionRooms,
          },
          dirId,
        })
        return this.reset()
      }

      if (this.room.parameters) {
        const options = {
          width: this.width || '0',
          height: this.height || '0',
          length: this.length || '0',
          spaces: {
            others: this.spaces || '0',
            dors: this.dors,
            windows: this.windows,
          },
        }
        this.resolvePromise({
          name,
          options,
          dirId,
        })
        return this.reset()
      }
      const data = {
        name,
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
        this.invalid = false
        return
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
    createItem(type) {
      const item = {
        id: Date.now(),
        width: '',
        height: '',
      }
      if (type === 'dors') {
        return this.dors.push(item)
      }
      this.windows.push(item)
    },
    clearItems(type) {
      this[type] = []
    },
    updateItem(type, id, key, value) {
      const node = this[type].find(item => item.id === id)
      node[key] = value
    },
    removeItem(type, id) {
      this[type] = this[type].filter(item => item.id !== id)
    },
  },
}
</script>

<template>
  <PopupModal ref="popup">
    <div class="modal">
      <span class="modal__title">{{ title }}</span>
      <form class="form" @submit.prevent="_confirm">
        <div class="modal__section main">
          <div class="form__group">
            <label class="form__label">{{ label }}</label>
            <div class="form__room">
              <InputText
                v-if="editName"
                v-model.trim="name"
                placeholder="Название помещения"
                class="input-name"
              />
              <Dropdown
                v-else
                v-model="room"
                :options="roomTypes"
                class="dropdown"
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
              <ToggleButton
                v-model="editName"
                v-tooltip.top="'Изменить название'"
                :disabled="!room"
                class="p-button-raised p-button-text"
                onIcon="pi pi-check"
                offIcon="pi pi-pencil"
              />
            </div>
          </div>
        </div>
        <template v-if="isSpecMontage">
          <MultiSelect
            v-model="optionRooms"
            :options="specRooms"
            optionLabel="name"
            optionValue="id"
          />
          <div class="modal__section calculated">
            <span class="section-title">Вычисляемые свойства</span>
            <CalculatedParameters :parameters="calculatedParameters" />
          </div>
        </template>
        <template v-else-if="showParameters">
          <div class="modal__section main-parameters">
            <div class="form__group">
              <label class="form__label">Длина</label>
              <InputNumber v-model="length" class="main-input" />
            </div>
            <div class="form__group">
              <label class="form__label">Ширина</label>
              <InputNumber v-model="width" class="main-input" />
            </div>
            <div class="form__group">
              <label class="form__label">Высота</label>
              <InputNumber
                v-model="height"
                :placeholder="placeholders['height']"
                class="main-input"
              />
            </div>
          </div>

          <div class="modal__section section spaces">
            <span class="section-title">Проемы</span>
            <span v-if="!isValidDorsAndWindows" class="error-message"
              >Заполните поля у проемов</span
            >
            <div class="form__flex form__lists">
              <ListItems
                title="Двери"
                label="Дверь"
                :items="dors"
                type="dors"
                @createItem="createItem('dors')"
                @clear="clearItems('dors')"
              />
              <ListItems
                title="Окна"
                label="Окно"
                :items="windows"
                type="windows"
                @createItem="createItem('windows')"
                @clear="clearItems('windows')"
              />
            </div>
            <div class="form__group">
              <label class="form__label">Дополнительные проемы</label>
              <InputNumber v-model="spaces" />
            </div>
          </div>
          <div class="modal__section calculated">
            <span class="section-title">Вычисляемые свойства</span>
            <CalculatedParameters :parameters="calculatedParameters" />
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

  &__section {
    border-bottom: 1px #ccc solid;
    padding-bottom: 10px;
  }

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

  &__lists {
    height: 300px;
    max-height: 300px;
  }

  &__flex &__group {
    flex: 1;
  }

  &__room {
    display: flex;
    gap: 10px;

    .dropdown,
    .input-name {
      flex: 1;
    }
  }

  &__spaces-title {
    display: flex;
    align-items: center;
  }
}
.input,
.select {
  border: 1px solid #a7a7a7;
  padding: 10px;
  outline: none;
}

.main {
  &-parameters {
    display: flex;
    justify-content: space-between;
    gap: 5px;
  }

  &-input {
    width: 100%;
  }
}

.section-title {
  font-size: 16px;
}

.error-message {
  color: $color-danger;
  display: block;
  font-weight: 600;
}
</style>
