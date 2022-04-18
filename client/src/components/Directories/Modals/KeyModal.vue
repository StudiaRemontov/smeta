<script>
import PopupModal from '../../UI/PopupModal.vue'
import keyTypes from '@/mixins/keyTypes.mixin'
import rootGetters from '@/mixins/rootGetters.mixin'

import { mapGetters } from 'vuex'

const getInitState = () => ({
  title: undefined,
  okButton: undefined,
  cancelButton: undefined,
  resolvePromise: undefined,
  rejectPromise: undefined,
  name: '',
  type: '',
  selectedDirectory: '',
  visibleKeys: [],
})

export default {
  components: { PopupModal },
  mixins: [keyTypes, rootGetters],
  data() {
    return getInitState()
  },
  computed: {
    ...mapGetters('directory', ['directories']),
    id() {
      return this.$route.params.id
    },
    options() {
      if (!this.id) return []
      return this.directories.filter(d => d._id !== this.id && d.values)
    },
    avaliableKeys() {
      if (!this.selectedDirectory) {
        return []
      }
      const directory = this.directories.find(
        d => d._id === this.selectedDirectory,
      )

      if (!directory) {
        return []
      }
      const root = directory.parent ? this.getRoot(directory.parent) : directory
      return root.keys
    },
  },
  methods: {
    async show(options) {
      this.title = options.title
      this.okButton = options.okButton
      this.cancelButton = options.cancelButton
      this.type = this.InputType.STRING
      if (options.key) {
        this.name = options.key.name
        this.type = options.key.type
        this.selectedDirectory = options.key.dirId
        this.visibleKeys = options.key.keys
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
      this.$refs.popup.close()
      const data = {
        name: this.name,
        type: this.type,
      }
      if (this.type === this.InputType.SELECT) {
        if (!this.selectedDirectory) {
          return
        }
        const root = this.getRoot(this.selectedDirectory)._id
        const dirId = this.selectedDirectory
        data.dirId = dirId
        data.root = root
        data.keys = this.visibleKeys
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
    resetSelectData() {
      this.selectedDirectory = ''
      this.visibleKeys = []
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
          <select v-model="type" class="select" @change="resetSelectData">
            <option
              v-for="option in typeOptions"
              class="select__option"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>
        <div v-if="type === InputType.SELECT" class="form__group">
          <select
            v-model="selectedDirectory"
            class="select"
            @change="visibleKeys = []"
          >
            <option
              v-for="option in options"
              :key="option._id"
              :value="option._id"
            >
              {{ option.name }}
            </option>
          </select>
          <div v-if="selectedDirectory">
            <span>Значения отображать</span>
            <div v-for="key in avaliableKeys" class="key" :key="key.id">
              <input
                v-model="visibleKeys"
                :id="key.id"
                :value="key.id"
                type="checkbox"
              />
              <label :for="key.id"> {{ key.name }} </label>
            </div>
          </div>
        </div>
      </form>
      <AppButton outlined variant="danger" @click="_remove">Удалить</AppButton>
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
