<script>
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'
import AppDropdowm from '@/components/UI/AppDropdown.vue'

export default {
  components: {
    ThreeDotsIcon,
    AppDropdowm,
  },
  props: {
    outlay: {
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
          handler: async () => {
            console.log('remve')
          },
        },
      ],
    }
  },
  methods: {
    openFolder() {
      this.$router.push('/outlay/1')
      //select outlay
      //router push
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

      // await this.updateById({
      //   id: this.directory._id,
      //   data: {
      //     name,
      //   },
      // })
    },
  },
}
</script>

<template>
  <li class="outlay-item" @dblclick="openFolder">
    <div class="outlay-item__header">
      <span
        v-if="!isEditing"
        @dblclick.stop="focusInput"
        class="outlay-item__name"
      >
        temp name
      </span>
      <!-- <input
        v-else
        ref="input"
        :value="outlay.name"
        class="outlay-item__input"
        placeholder="Введите название паки"
        @change="update"
        @focus="isEditing = true"
        @blur="isEditing = false"
      /> -->
      <AppDropdowm v-if="!isEditing" ref="dropdown" :items="items">
        <ThreeDotsIcon />
      </AppDropdowm>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.outlay-item {
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
    word-break: break-word;
    user-select: auto;
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
