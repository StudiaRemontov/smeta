<script>
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'
import AppDropdowm from '@/components/UI/AppDropdown.vue'
import { mapActions, mapMutations } from 'vuex'

export default {
  components: {
    ThreeDotsIcon,
    AppDropdowm,
  },
  inject: ['parent'],
  props: {
    directory: {
      type: Object,
      required: true,
    },
    parent: {
      type: Object,
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
          handler: () => {
            if (!this.parent) {
              return this.removeDirectory(this.directory._id)
            }
            this.removeSubdirectory({
              parent: this.parent,
              subId: this.directory._id,
            })
          },
        },
      ],
    }
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
      if (!this.parent) {
        this.setParent(this.directory)
      }
      this.setSelectedDirectory(this.directory)
    },
    update(e) {
      this.$refs.input.blur()
      const name = e.target.value
      const data = {
        ...this.directory,
        name,
      }
      if (this.parent) {
        return this.updateSubDirectory({
          id: this.directory._id,
          data,
        })
      }
      this.updateById({
        id: this.directory._id,
        data,
      })
    },
  },
}
</script>

<template>
  <li class="directory-item">
    <div class="directory-item__header">
      <span
        v-if="!isEditing"
        class="directory-item__name"
        @dblclick="openFolder"
      >
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
      {{
        directory.dirs.length > 0
          ? `Элементов ${directory.dirs.length}`
          : 'Нет элементов'
      }}
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
  }

  &__name {
    font-size: $font-medium;
    font-weight: 700;
    user-select: none;
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
