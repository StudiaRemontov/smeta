<script>
import ViewListIcon from '@/components/UI/Icons/ViewListIcon.vue'

import { mapGetters, mapMutations } from 'vuex'

import emitter from '@/modules/eventBus'

import { getAllValues } from '@/helpers/treeMethods'

export default {
  components: {
    ViewListIcon,
  },
  props: {
    room: {
      type: Object,
      required: true,
    },
    active: Boolean,
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
    ...mapGetters('outlay', ['showOnlyChecked', 'quantityKey']),
    textColor() {
      return this.active ? '#545454' : '#c8c8c8'
    },
    viewMode: {
      get() {
        return this.showOnlyChecked && this.active
      },
      set(value) {
        this.setViewMode(value)
      },
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSelectedRoom', 'setShowOnlyChecked']),
    openContext(e) {
      this.$emit('open-menu', e, this.room)
    },
    getInvalidJobs() {
      const nodes = this.room.jobs.map(getAllValues).flat()
      return nodes.filter(n => n.data[this.quantityKey.id] === 0)
    },
    async setViewMode(value) {
      this.setSelectedRoom(this.room)
      if (value) {
        await this.$nextTick()
        const invalidNodes = this.getInvalidJobs()
        if (invalidNodes.length > 0) {
          const invalidNode = invalidNodes[0]
          return emitter.$emit('scrollTo', invalidNode.key)
        }
      }
      this.setShowOnlyChecked(value)
    },
  },
}
</script>

<template>
  <div class="room-item" :class="{ active }" @click="setSelectedRoom(room)">
    <div class="room-item__text">
      <span class="room-item__title" :title="room.name"> {{ room.name }} </span>
    </div>
    <div class="room-item__actions" @click.stop>
      <button class="button" @click="viewMode = !viewMode">
        <ViewListIcon
          class="icon"
          :class="{ active: active && showOnlyChecked }"
        />
      </button>
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
  }

  &__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    border-left: 1px solid v-bind(textColor);
  }

  .icon {
    color: v-bind(textColor);

    &.active {
      color: #00afec;
    }
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
