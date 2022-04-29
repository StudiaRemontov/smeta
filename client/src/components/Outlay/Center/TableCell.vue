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
    }
  },
  computed: {
    ...mapGetters('directory', ['directories', 'root', 'roots']),
    ...mapGetters('outlay', ['activeData']),
    newValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    key() {
      const directory = this.directories.find(
        d => d._id === this.activeData.dirId,
      )
      const dirKey = directory.keys.find(k => k.id === this.col)
      const key = this.activeData.keys.find(k => k.id === this.col)
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
      const root = this.roots.find(d => d._id === this.activeData.dirId)
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
  mounted() {
    if (this.type === this.InputType.NUMBER) {
      this.valueBefore = this.modelValue
    }
  },
  methods: {
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
      this.newValue = +(this.valueBefore * this.coef).toFixed(2)
    },
  },
}
</script>

<template>
  <td class="table-cell" :colspan="colspan">
    <template v-if="isClone && isEditing">
      <input
        v-if="type === InputType.STRING"
        v-model="newValue"
        class="input"
        type="text"
        @click.stop
      />
      <input
        v-else-if="type === InputType.NUMBER"
        v-model="newValue"
        class="input"
        type="number"
        @click.stop
      />
      <select
        v-else-if="type === InputType.SELECT"
        v-model="newValue"
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
        v-if="isSelected && type === InputType.NUMBER"
        class="table-cell__value"
        :class="{ editing: coefIsVisible }"
        @click.stop="coefIsVisible = !coefIsVisible"
      >
        <span>
          {{ modelValue }}
        </span>
        <template v-if="coefIsVisible">
          <span> x </span>
          <input
            v-model="coef"
            @input="changePrice"
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
.table-cell {
  padding: 8px;
  // &:not(&--children) {
  //   font-weight: 600;
  //   text-align: center !important;
  // }

  &__value {
    display: flex;
    align-items: center;
    gap: 5px;

    &.editing {
      flex: 1;
      display: flex;
      gap: 15px;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
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

  &--coef {
    flex-basis: 50%;
    width: 50px;
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
