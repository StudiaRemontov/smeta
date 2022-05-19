<script>
import ViewListIcon from '@/components/UI/Icons/ViewListIcon.vue'
import ContextMenu from 'primevue/contextmenu'

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    ViewListIcon,
    ContextMenu,
  },
  props: {
    room: {
      type: Object,
      required: true,
    },
    active: Boolean,
  },
  emits: ['edit', 'remove'],
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
    ...mapGetters('outlay', ['showOnlyChecked']),
    textColor() {
      return this.active ? '#545454' : '#c8c8c8'
    },
    viewMode: {
      get() {
        return this.showOnlyChecked && this.active
      },
      set(value) {
        this.setSelectedRoom(this.room)
        this.setShowOnlyChecked(value)
      },
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSelectedRoom', 'setShowOnlyChecked']),
    openContext(e) {
      this.$refs.menu.show(e)
    },
  },
}
</script>

<template>
  <ContextMenu ref="menu" :model="items" />
  <div class="room-item" :class="{ active }" @click="setSelectedRoom(room)">
    <div class="room-item__text">
      <span class="room-item__title"> {{ room.name }} </span>
    </div>
    <div class="room-item__actions" @click.stop>
      <button class="button" @click="viewMode = !viewMode">
        <ViewListIcon class="icon" />
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
    align-items: center;
    gap: 11px;
    border-left: 1px solid v-bind(textColor);
    padding-left: 15px;
  }

  .icon {
    color: v-bind(textColor);
  }

  // &.active {
  //   $color: v-bind($textColor);
  // }
}

.button {
  display: flex;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  border: none;
  outline: none;
}

.icon {
  color: #fff;
}
</style>
