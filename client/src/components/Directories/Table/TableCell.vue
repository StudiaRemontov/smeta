<script>
import keyTypes from '@/mixins/keyTypes.mixin'
import TreeSelect from 'primevue/treeselect'

import { getChildren } from '@/store/modules/directory.module'
import roomTypes from '@/enum/roomTypes'

import { mapGetters } from 'vuex'

export default {
  components: { TreeSelect },
  mixins: [keyTypes],
  props: {
    value: {
      required: true,
    },
    field: {
      required: true,
      type: String,
    },
    rowIndex: {
      required: true,
      type: Number,
    },
  },
  emits: ['change'],
  data() {
    return {
      timeout: null,
      hasUnmounted: false,
      selectedCollections: {},
      roomTypes: roomTypes,
    }
  },
  computed: {
    ...mapGetters('directory', ['root', 'roots', 'directories']),
    key() {
      return this.root.keys.find(k => k.id === this.field)
    },
    type() {
      return this.key?.type
    },
    componentName() {
      const numberComponents = [
        this.InputType.NUMBER,
        this.InputType.PRICE,
        this.InputType.QUANTITY,
      ]
      const selectComponents = [this.InputType.SELECT, this.InputType.FORMULA]
      if (numberComponents.includes(this.type)) {
        return 'InputNumber'
      }
      if (selectComponents.includes(this.type)) {
        return 'Dropdown'
      }
      return 'InputText'
    },
    newValue: {
      get() {
        return this.value
      },
      set(value) {
        const numberTypes = [
          this.InputType.PRICE,
          this.InputType.QUANTITY,
          this.InputType.NUMBER,
        ]
        if (numberTypes.includes(this.type)) {
          if (this.timeout) {
            clearTimeout(this.timeout)
          }
          this.timeout = setTimeout(() => {
            if (!this.hasUnmounted) {
              return this.$emit('change', this.rowIndex, this.field, value)
            }
          }, 300)
          return
        }
        this.$emit('change', this.rowIndex, this.field, value)
      },
    },
    treeSelectValues: {
      get() {
        if (
          (this.type !== this.InputType.COLLECTION &&
            this.type !== this.InputType.COLLECTION_VALUES) ||
          !this.value
        ) {
          return {}
        }
        return this.value.reduce((acc, key) => {
          acc[key] = {
            checked: true,
          }
          return acc
        }, {})
      },
      set(value) {
        const keys = Object.keys(value)
        this.$emit('change', this.rowIndex, this.field, keys)
      },
    },
    options() {
      if (
        this.type !== this.InputType.SELECT &&
        this.type !== this.InputType.FORMULA
      ) {
        return []
      }

      const root = this.roots.find(d => d._id === this.key.root)
      if (!root) {
        return []
      }
      const keys = root.keys.filter(k => this.key.keys.includes(k.id))
      if (!keys.length) {
        return []
      }
      const directoryOfValues = this.directories.find(
        d => d._id === this.key.dirId,
      )
      const values = directoryOfValues.values.map(row => {
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

      return [
        { value: undefined, text: 'Выберите значение', hidden: true },
        ...values,
      ]
    },
    collections() {
      if (this.type !== this.InputType.COLLECTION) {
        return []
      }
      const { rootDir } = this.key
      const directory = this.roots.find(d => d._id === rootDir)
      const children = getChildren(directory, this.directories)
      const tree = this.createTree(directory, children)
      const { children: treeChildren } = tree
      return treeChildren
    },
    collectionsWithValues() {
      if (this.type !== this.InputType.COLLECTION_VALUES) {
        return []
      }
      const { rootDir } = this.key
      const directory = this.roots.find(d => d._id === rootDir)
      const directoryClone = JSON.parse(JSON.stringify(directory))
      const { keys } = directoryClone
      const directoriesClone = JSON.parse(JSON.stringify(this.directories))
      const directoriesWithValues = getChildren(
        directoryClone,
        directoriesClone,
      )
      const fullDirectories = directoriesWithValues.map(dir => {
        const { values } = dir
        if (!values) {
          return dir
        }
        dir.children = values.map(value => {
          const { data, id } = value
          const subDir = {
            _id: id,
            name: data[keys[0].id],
          }
          return subDir
        })

        return dir
      })
      const tree = this.createTreeWithValues(directoryClone, fullDirectories)
      const { children: treeChildren } = tree
      return treeChildren
    },
  },
  unmounted() {
    this.hasUnmounted = true
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
    createTreeNode(directory) {
      return {
        key: directory._id,
        label: directory.name,
        children: [],
      }
    },
    createTree(directory, directories) {
      const node = this.createTreeNode(directory)
      const children = directories.filter(d => d.parent === directory._id)
      node.children = children.map(c => this.createTree(c, directories))
      return node
    },
    createTreeWithValues(directory, directories) {
      const node = this.createTreeNode(directory)
      const children = directories.filter(d => d.parent === directory._id)
      if (children.length > 0) {
        node.children = children.map(c =>
          this.createTreeWithValues(c, directories),
        )
        return node
      }

      const { children: dirChildren } = directory
      if (dirChildren) {
        const childNodes = dirChildren.map(child => {
          return this.createTreeNode(child)
        })
        node.children = childNodes
      }
      return node
    },
  },
}
</script>

<template>
  <input
    v-if="type === InputType.STRING"
    v-model.lazy="newValue"
    class="input"
    placeholder="Введите значение"
    type="text"
  />
  <input
    v-else-if="type === InputType.NUMBER"
    v-model.lazy="newValue"
    class="input"
    placeholder="Введите значение"
    type="number"
  />
  <input
    v-else-if="type === InputType.PRICE || type === InputType.QUANTITY"
    v-model.lazy="newValue"
    class="input"
    placeholder="Введите значение"
    type="number"
    :min="0"
  />
  <select
    v-else-if="type === InputType.SELECT || type === InputType.FORMULA"
    v-model="newValue"
    class="input"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :hidden="option.hidden"
      :value="option.value"
    >
      {{ option.text }}
    </option>
  </select>
  <TreeSelect
    v-else-if="type === InputType.COLLECTION"
    v-model="treeSelectValues"
    class="tree-select"
    :options="collections"
    selectionMode="checkbox"
    placeholder="Выберите элементы"
  ></TreeSelect>
  <TreeSelect
    v-else-if="type === InputType.COLLECTION_VALUES"
    v-model="treeSelectValues"
    class="tree-select"
    :options="collectionsWithValues"
    selectionMode="checkbox"
    placeholder="Выберите элементы"
  ></TreeSelect>
  <input
    v-else-if="
      type === InputType.BOOLEAN_ROOM_PARAMETERS ||
      type === InputType.BOOLEAN_ROOM_COMPUTED
    "
    v-model="newValue"
    type="checkbox"
  />
</template>

<style lang="scss" scoped>
.input {
  max-width: 100%;
  width: 100%;
  outline: none;
  border-radius: 4px;
  border: 1px solid #ced4da;
  padding: 6px;

  &:focus {
    border-color: #3b82f6;
  }
}

.tree-select {
  max-width: 200px;
  width: 100%;
  overflow: hidden;
}
</style>
