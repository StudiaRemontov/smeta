<script>
import keyTypes from '@/mixins/keyTypes.mixin'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import { mapGetters } from 'vuex'

export default {
  components: {
    InputNumber,
    InputText,
  },
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
    children: Boolean,
    isClone: Boolean,
    editable: Boolean,
    rowId: Number,
  },
  computed: {
    ...mapGetters('edition', ['active']),
    ...mapGetters('directory', ['directories']),
    key() {
      const directory = this.directories.find(d => d._id === this.active.dirId)
      const dirKey = directory.keys.find(k => k.id === this.col)
      const key = this.active.keys.find(k => k.id === this.col)
      return {
        ...key,
        type: dirKey.type,
      }
    },
    type() {
      return this.key.type
    },
    readonly() {
      return this.key.readonly
    },
  },
}
</script>

<template>
  <td class="table-cell" :class="{ children }" :colspan="colspan">
    <template v-if="isClone && editable">
      <InputNumber
        v-if="type === InputType.NUMBER"
        :value="modelValue"
        @click.stop
      />
      <InputText
        v-else-if="type === InputType.STRING"
        :value="modelValue"
        @click.stop
      />
    </template>
    <template v-else-if="editable && !readonly">
      <template v-if="type === InputType.NUMBER">
        {{ modelValue }}
        <InputNumber :value="1" @click.stop />
      </template>
      <InputText
        v-else-if="type === InputType.STRING"
        :value="modelValue"
        @click.stop
      />
    </template>
    <template v-else>
      {{ modelValue }}
    </template>
    <!-- <template v-if="!readonly && editable">
      <InputNumber
        v-if="type === InputType.NUMBER"
        :value="modelValue"
        @click.stop
      />
      <InputText
        v-else-if="type === InputType.STRING"
        :value="modelValue"
        @click.stop
      />
    </template>
    <template v-else> -->
    <!-- </template> -->
  </td>
</template>

<style lang="scss" scoped>
.table-cell {
  padding: 8px;
  text-align: center;
  &:not(.children) {
    font-weight: 600;
    text-align: left !important;
  }

  &:first-of-type {
    text-align: left;
  }
}

::v-deep(.p-inputnumber-input) {
  width: 100%;
  text-align: center;
  border: none !important;
  box-shadow: none !important;
  padding: 2px 0;
  outline: none;

  &:focus {
    outline: 1px black solid !important;
  }
}
</style>
