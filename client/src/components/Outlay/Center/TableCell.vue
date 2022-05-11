<script>
import keyTypes from '@/mixins/keyTypes.mixin'
import { mapGetters } from 'vuex'

export default {
  mixins: [keyTypes],
  props: {
    modelValue: {
      required: true,
    },
    col: {
      type: String,
      required: true,
    },
    colspan: {
      type: Number,
      default: 0,
    },
    isClone: Boolean,
    isEditing: Boolean,
    isSelected: Boolean,
  },
  data() {
    return {
      coef: 1,
      coefIsVisible: false,
      valueBefore: null,
      editQuantity: false,
      timeout: null,
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'root', 'roots']),
    ...mapGetters('outlay', ['activeData', 'edition', 'keys']),
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        if (
          this.type === this.InputType.PRICE ||
          this.type === this.InputType.QUANTITY
        ) {
          if (this.timeout) {
            this.timeout = clearTimeout(this.timeout)
          }
          this.timeout = setTimeout(() => {
            this.$emit('update:modelValue', value)
          }, 500)
          return
        }
        this.$emit('update:modelValue', value)
      },
    },
    key() {
      const directory = this.directories.find(d => d._id === this.edition.dirId)
      const dirKey = directory.keys.find(k => k.id === this.col)
      const key = this.keys.find(k => k.id === this.col)
      return {
        ...key,
        type: dirKey.type,
      }
    },
    type() {
      return this.key.type
    },
    options() {
      if (this.type !== this.InputType.SELECT) {
        return []
      }
      const root = this.roots.find(d => d._id === this.edition.dirId)
      const key = root.keys.find(k => k.id === this.key.id)
      const keyRoot = this.roots.find(r => r._id === key.root)

      const keys = keyRoot.keys.filter(k => key.keys.includes(k.id))

      if (!keys.length) {
        return []
      }
      const directoryOfValues = this.directories.find(d => d._id === key.dirId)
      return directoryOfValues.values.map(row => {
        const text = keys.map(key => {
          if (key.type === this.InputType.SELECT) {
            const findingRow = row.data[key.id]
            return this.getValueOfCell(
              key.dirId,
              key.root,
              findingRow,
              key.keys,
            )
          }

          return row.data[key.id]
        })
        return {
          value: row.id,
          text: text.join(', '),
        }
      })
    },
  },
  watch: {
    isSelected(value) {
      if (!value) {
        this.coefIsVisible = false
      }
    },
    isEditing(value) {
      if (value) return
      this.setValueBefore()
    },
  },
  mounted() {
    this.setValueBefore()
  },
  methods: {
    setValueBefore() {
      if (this.type === this.InputType.PRICE) {
        this.valueBefore = this.modelValue
        this.coef = 1
      }
    },
    getValueOfCell(dirId, root, rowId, keys) {
      const directory = this.directories.find(d => d._id === dirId)
      if (!directory) return null
      const rootDir = this.roots.find(d => d._id === root)
      const visibleKeys = rootDir.keys.filter(k => keys.includes(k.id))
      const vals = visibleKeys.map(key => {
        const row = directory.values.find(r => r.id === +rowId)
        if (key.type === this.InputType.SELECT) {
          const findingRow = row.data[key.id]
          return this.getValueOfCell(key.dirId, key.root, findingRow, key.keys)
        }

        return row.data[key.id]
      })
      return vals
    },
    changePrice() {
      if (this.coef < 1) this.coef = 1
      this.newValue = +(this.valueBefore * this.coef).toFixed(2)
    },
    stopEditing() {
      this.coefIsVisible = false
      this.editQuantity = false
    },
    cellClick(e) {
      if (this.type === this.InputType.PRICE && this.isSelected) {
        e.stopPropagation()
        this.coefIsVisible = !this.coefIsVisible
      }
    },
  },
}
</script>

<template>
  <td class="table-cell" :colspan="colspan" @click="cellClick">
    <div
      v-if="coefIsVisible || editQuantity"
      class="blocker"
      @click.stop="stopEditing"
    ></div>
    <input
      v-if="type === InputType.QUANTITY"
      v-model.lazy="newValue"
      class="input"
      type="number"
      @click.stop
    />
    <template v-else-if="isClone && isEditing">
      <input
        v-if="type === InputType.STRING"
        v-model.lazy="newValue"
        class="input"
        type="text"
        @click.stop
      />
      <input
        v-else-if="type === InputType.NUMBER || type === InputType.PRICE"
        v-model.lazy="newValue"
        class="input"
        type="number"
        @click.stop
      />
      <select
        v-else-if="type === InputType.SELECT"
        v-model.lazy="newValue"
        class="input"
        @click.stop
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.text"
        >
          {{ option.text }}
        </option>
      </select>
    </template>
    <div class="table-cell__value" v-else>
      <div
        v-if="isSelected && type === InputType.PRICE"
        class="table-cell__value"
        :class="{ editing: coefIsVisible }"
      >
        <span>
          {{ modelValue }}
        </span>
        <template v-if="coefIsVisible">
          <span> x </span>
          <input
            v-model.lazy="coef"
            @change="changePrice"
            class="input input--coef"
            type="number"
            min="1"
            step="0.1"
            @click.stop
          />
        </template>
      </div>
      <span v-else>
        {{ modelValue }}
      </span>
    </div>
  </td>
</template>

<style lang="scss" scoped>
.blocker {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.table-cell {
  padding: 8px;
  text-align: left;

  &__value {
    display: flex;
    align-items: center;
    gap: 5px;

    &.editing {
      flex: 1;
      display: flex;
      gap: 15px;
      align-items: center;
    }
  }

  &:first-of-type {
    text-align: left;

    .input {
      text-align: left;
      width: 100%;
    }
  }

  &:first-of-type &__value {
    justify-content: flex-start;
  }
}

.input {
  max-width: 100%;
  z-index: 2;

  &--coef {
    flex-basis: 50%;
    max-width: 50px;
    text-align: center;
    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    &[type='number'] {
      -moz-appearance: textfield;
    }
  }
}
</style>
