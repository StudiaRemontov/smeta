<script>
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'
import AppDropdowm from '@/components/UI/AppDropdown.vue'
import { mapMutations } from 'vuex'

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
  },
  data() {
    return {
      items: [
        {
          text: 'Редактировать',
          handler() {
            console.log('go to edit')
          },
        },
        {
          text: 'Удалить',
          handler: () => {
            this.removeSubDirectory({
              dirId: this.parent.id,
              subDir: this.directory.id,
            })
          },
        },
      ],
    }
  },
  methods: {
    ...mapMutations('directory', ['removeSubDirectory']),
  },
}
</script>

<template>
  <li class="directory-item">
    <div class="directory-item__content">
      <span class="directory-item__name"> {{ directory.name }} </span>
      <span class="directory-item__counter">
        {{
          directory.dirs.length > 0
            ? `Элементов ${directory.dirs.length}`
            : 'Нет элементов'
        }}
      </span>
    </div>
    <div class="directory-item__controlls">
      <AppDropdowm ref="dropdown" :items="items">
        <ThreeDotsIcon />
      </AppDropdowm>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.directory-item {
  cursor: pointer;
  border: 1px solid #a7a7a7;
  border-radius: 10px;
  display: flex;
  padding: 20px 15px 15px;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__name {
    flex: 1;
    font-size: $font-medium;
    font-weight: 700;
  }

  &__counter {
    font-weight: 700;
    font-size: $font-small;
    line-height: 15px;
    color: #808080;
  }
}
</style>
