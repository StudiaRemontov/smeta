<script>
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'
import AppDropdown from '@/components/UI/AppDropdown.vue'
import rootGetters from '@/mixins/rootGetters.mixin'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ThreeDotsIcon,
    AppDropdown,
  },
  mixins: [rootGetters],
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
            const { values } = this.directory
            if ((!values || values?.length === 0) && !this.subFolders.length) {
              return await this.removeDirectory(this.directory._id)
            }
            const edition = this.editions.find(root => {
              return root.dirId === this.directory._id
            })
            if (edition) {
              const priceList = this.priceLists.find(p =>
                p.editions.includes(edition._id),
              )
              if (priceList) {
                return this.$emit('alert', {
                  priceList: priceList.name,
                })
              }
            }
            //check if dir is architecture
            if (values) {
              //check if architecture in use
              const inUse = this.checkIfArchitectureInUse(this.directory)
              const inUseList = inUse.map(({ name }) => name)
              //if in use show alert
              if (inUse.length > 0) {
                return this.$emit('alert', {
                  directories: inUseList,
                })
              }
              //else check if architecture has values and show alert
              if (values.length > 0) {
                return this.$emit('remove', {
                  id: this.directory._id,
                  folderName: this.directory.name,
                  subItemsLength: values.length,
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
              return [...this.getRoots(d.parent), d]
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
    ...mapGetters('directory', ['directories', 'root', 'roots']),
    ...mapGetters('edition', ['editions']),
    ...mapGetters('priceList', ['priceLists']),
    subFolders() {
      return this.directories.filter(d => d.parent === this.directory._id)
    },
    counter() {
      if (this.subFolders.length > 0) {
        return this.subFolders.length
      }
      const { values } = this.directory
      const valuesLength = values ? values.length : 0

      if (valuesLength > 0) {
        return values.length
      }

      return 'Нет элементов'
    },
  },
  methods: {
    ...mapMutations('directory', ['setRoot']),
    ...mapActions('directory', ['removeDirectory', 'updateById']),
    openFolder() {
      if (!this.directory.parent) {
        this.setRoot(this.directory._id)
      }
      this.$router.push(`/directories/${this.directory._id}`)
    },
    async focusInput() {
      this.isEditing = true
      await this.$nextTick()
      this.$refs.input.focus()
      this.$refs.input.select()
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
      return this.roots.filter(d => {
        const { parent } = d

        if (parent) {
          return false
        }

        return d.keys.some(k => k.dirId === architecture._id)
      })
    },
  },
}
</script>

<template>
  <li class="directory-item" @dblclick="openFolder">
    <div class="directory-item__header">
      <span
        v-if="!isEditing"
        @dblclick.stop="focusInput"
        class="directory-item__name"
        :title="directory.name"
      >
        {{ directory.name }}
      </span>
      <input
        v-else
        ref="input"
        :value="directory.name"
        class="directory-item__input"
        placeholder="Введите название паки"
        @change="update"
        @focus="isEditing = true"
        @blur="isEditing = false"
      />
      <AppDropdown v-if="!isEditing" ref="dropdown" :items="items">
        <ThreeDotsIcon />
      </AppDropdown>
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

  &__header {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
  }

  &__name {
    font-size: $font-medium;
    font-weight: 700;
    word-break: break-word;
    user-select: auto;
    overflow: hidden;
  }

  &__input {
    max-width: 100%;
    width: 100%;
    font-size: $font-medium;
    font-weight: 700;
    border: none;
  }

  &__counter {
    font-weight: 700;
    font-size: $font-small;
    line-height: 15px;
    color: #808080;
  }
}
</style>
