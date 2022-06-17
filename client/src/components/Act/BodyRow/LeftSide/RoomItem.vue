<script>
import ViewListIcon from '@/components/UI/Icons/ViewListIcon.vue'

import { mapGetters, mapMutations } from 'vuex'

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
  computed: {
    ...mapGetters('acts', ['showOnlyCompleted']),
    textColor() {
      return this.active ? '#545454' : '#c8c8c8'
    },
    viewMode: {
      get() {
        return this.showOnlyCompleted && this.active
      },
      set(value) {
        this.setShowOnlyCompleted(value)
      },
    },
  },
  methods: {
    ...mapMutations('acts', ['setActiveRoom', 'setShowOnlyCompleted']),
  },
}
</script>

<template>
  <div class="room-item" :class="{ active }" @click="setActiveRoom(room)">
    <div class="room-item__text">
      <span class="room-item__title" :title="room.name"> {{ room.name }} </span>
    </div>
    <div class="room-item__actions">
      <button class="button" @click="viewMode = !viewMode">
        <ViewListIcon
          class="icon"
          :class="{ active: active && showOnlyCompleted }"
        />
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
