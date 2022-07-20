<script>
import { mapGetters, mapMutations } from 'vuex'

import emitter from '@/modules/eventBus'

export default {
  props: {
    room: {
      type: Object,
      required: true,
    },
    active: Boolean,
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['edit', 'remove', 'open-menu'],
  data() {
    return {
      items: [
        {
          label: 'Редактировать',
          icon: 'pi pi-pencil',
          command: () => {
            this.setSelectedRoom(this.room)
            this.$emit('edit')
          },
        },
        {
          label: 'Удалить',
          icon: 'pi pi-trash',
          command: () => {
            this.$emit('remove', this.room.id)
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters('outlay', [
      'showOnlyChecked',
      'quantityKey',
      'invalidJobs',
      'selectedRoom',
    ]),
    textColor() {
      return this.active ? '#545454' : '#c8c8c8'
    },
    invalidNodes() {
      return this.invalidJobs[this.room.id]
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSelectedRoom', 'setShowOnlyChecked']),
    openContext(e) {
      this.$emit('open-menu', e, this.room)
    },
    async scrollToInvalid() {
      if (!this.active) {
        this.setSelectedRoom(this.room)
      }
      await this.$nextTick()
      const invalidNode = this.invalidNodes[0]
      return emitter.$emit('scrollTo', invalidNode.key)
    },
    clickHandler() {
      const invalidNodes = this.invalidJobs[this.selectedRoom?.id]
      if (
        this.selectedRoom &&
        this.selectedRoom.id !== this.room.id &&
        invalidNodes &&
        invalidNodes.length > 0
      ) {
        return this.$toast.add({
          severity: 'warn',
          detail: 'Заполните количество у выбранных работ',
          life: 3000,
        })
      }
      this.setSelectedRoom(this.room)
    },
  },
}
</script>

<template>
  <div class="room-item" :class="{ active }">
    <div class="room-item__text">
      <span class="room-item__title" :title="room.name" @click="clickHandler">
        {{ room.name }}
      </span>
      <div class="room-item__counter-wrapper">
        <span
          v-if="invalidNodes && invalidNodes.length > 0"
          v-tooltip.top="`незаполненных работ`"
          class="room-item__counter"
          @click="scrollToInvalid"
        >
          {{ invalidNodes.length }}
        </span>
      </div>
    </div>
    <div class="room-item__actions" @click.stop>
      <button class="button room-item__button" @click.stop="openContext">
        <i class="pi pi-ellipsis-h icon"></i>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-item {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 4px 15px;
  border-radius: 4px;
  cursor: pointer;
  height: 40px;
  min-height: 40px;
  overflow: hidden;
  border: 1px solid v-bind(textColor);
  border-radius: 10px;
  color: v-bind(textColor);

  &__text {
    display: flex;
    align-items: center;
    overflow: hidden;
    justify-content: space-between;
    flex: 1;
  }

  &__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    flex: 1;

    &:hover {
      text-decoration: underline;
    }
  }

  &__actions {
    display: flex;
    border-left: 1px solid v-bind(textColor);
  }

  &__counter {
    font-size: 12px;
    color: #fff;
    background-color: #de4848;
    border-radius: 10px;
    padding: 5px;
    line-height: 3px;
    font-weight: 700;
  }

  .icon {
    color: v-bind(textColor);
  }
}

.button {
  display: flex;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  border: none;
  outline: none;
  padding: 0 7px;
}

.icon {
  color: #fff;
}
</style>
