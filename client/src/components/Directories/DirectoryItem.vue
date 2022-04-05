<script>
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'
import AppDropdowm from '@/components/UI/AppDropdown.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ThreeDotsIcon,
    AppDropdowm,
  },
  props: {
    directory: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isEditing: false,
      items: [
        {
          text: 'Редактировать',
          handler: async () => {
            this.isEditing = true
            await this.$nextTick()
            this.$refs.input.focus()
          },
        },
        {
          text: 'Удалить',
          handler: async () => {
            //check if empty
            const { data } = this.directory
            if (
              (!data || data?.values?.length === 0) &&
              !this.subFolders.length
            ) {
              return await this.removeDirectory(this.directory._id)
            }
            //check if dir is architecture
            if (data) {
              //check if architecture in use
              const inUse = this.checkIfArchitectureInUse(this.directory)
              const paths = inUse.map(d => {
                return [...this.getParents(d.parent), d]
              })
              //if in use show alert
              if (paths.length > 0) {
                return this.$emit('alert', {
                  paths,
                })
              }
              //else check if architecture has values and show alert
              if (data.values.length > 0) {
                return this.$emit('remove', {
                  id: this.directory._id,
                  folderName: this.directory.name,
                  subItemsLength: data.values.length,
                })
              }
            }
            //get all items inside dir
            const items = this.getItemsInsideDirectory(this.directory)

            //get only architecture
            const architectures = items.filter(item => item.data)

            //check if architectures in use
            const architecturesInUse = architectures
              .map(arc => this.checkIfArchitectureInUse(arc))
              .flat()

            const paths = architecturesInUse.map(d => {
              return [...this.getParents(d.parent), d]
            })
            if (paths.length > 0) {
              return this.$emit('alert', {
                paths,
              })
            }

            //check sub folders length
            const subItemsLength = this.subFolders.length
            if (subItemsLength > 0) {
              return this.$emit('remove', {
                id: this.directory._id,
                folderName: this.directory.name,
                subItemsLength,
              })
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters('directory', ['directories']),
    subFolders() {
      return this.directories.filter(d => d.parent === this.directory._id)
    },
    counter() {
      if (this.subFolders.length > 0) {
        return this.subFolders.length
      }
      const { data } = this.directory
      const valuesLength = data.values ? data.values.length : 0

      if (valuesLength > 0) {
        return data.values.length
      }

      return 'Нет элементов'
    },
  },
  methods: {
    ...mapMutations('directory', [
      'removeSubdirectory',
      'setSelectedDirectory',
      'updateSubDirectory',
      'setParent',
    ]),
    ...mapActions('directory', ['removeDirectory', 'updateById']),
    openFolder() {
      this.$router.push(`/directories/${this.directory._id}`)
    },
    async update(e) {
      this.$refs.input.blur()
      const name = e.target.value

      await this.updateById({
        id: this.directory._id,
        data: {
          name,
        },
      })
    },
    getParents(directory) {
      const parent = this.directories.find(d => d._id === directory)
      if (!parent) {
        return []
      }
      if (parent.parent) {
        return [...this.getParents(parent.parent), parent]
      }

      return [parent]
    },
    getArchitecturesUseData(directory) {
      return this.directories.filter(d => {
        const { data } = d
        if (d._id === directory._id || !data) {
          return false
        }

        return data.keys.some(key => key.dirId === directory._id)
      })
    },
    getItemsInsideDirectory(directory) {
      const { data } = directory

      if (data) {
        return []
      }

      const children = this.directories.filter(d => d.parent === directory._id)
      if (children.length > 0) {
        const subItems = children
          .map(c => this.getItemsInsideDirectory(c))
          .flat()
        return [...children, ...subItems]
      }

      return []
    },
    checkIfArchitectureInUse(architecture) {
      return this.directories.filter(d => {
        const { data } = d

        if (!data) {
          return false
        }

        return data.keys.some(k => k.dirId === architecture._id)
      })
    },
  },
}
</script>

<template>
  <li class="directory-item" @dblclick="openFolder">
    <div class="directory-item__header">
      <span v-if="!isEditing" class="directory-item__name">
        {{ directory.name }}
      </span>
      <input
        v-else
        ref="input"
        :value="directory.name"
        class="directory-item__input"
        :disabled="!isEditing"
        @change="update"
        @focus="isEditing = true"
        @blur="isEditing = false"
      />
      <AppDropdowm v-if="!isEditing" ref="dropdown" :items="items">
        <ThreeDotsIcon />
      </AppDropdowm>
    </div>
    <span v-if="!isEditing" class="directory-item__counter">
      {{ counter }}
    </span>
  </li>
</template>

<style lang="scss" scoped>
.directory-item {
  cursor: pointer;
  border: 1px solid #a7a7a7;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 15px 15px;
  user-select: none;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__name {
    font-size: $font-medium;
    font-weight: 700;
    word-break: break-word;
  }

  &__input {
    max-width: 100%;
    width: 100%;
    font-size: $font-medium;
    font-weight: 700;
    border: none;
    outline: none;

    &:disabled {
      pointer-events: all;
      background-color: transparent;
      color: #000;
      cursor: pointer;
    }
  }

  &__counter {
    font-weight: 700;
    font-size: $font-small;
    line-height: 15px;
    color: #808080;
  }
}
</style>
