<script>
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Menu from 'primevue/menu'
import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    Button,
    Checkbox,
    Menu,
  },
  props: {
    room: {
      type: Object,
      required: true,
    },
    active: Boolean,
  },
  data() {
    return {
      items: [
        {
          label: 'Редактировать',
          command: () => {
            this.selectRoom({
              id: this.room.id,
              showOnlySelected: false,
            })
            this.$emit('edit')
          },
        },
        {
          label: 'Удалить',
          command: () => {
            this.$emit('remove', this.room.id)
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters('outlay', ['showOnlySelected']),
    textColor() {
      return '#fff'
    },
    viewMode: {
      get() {
        return this.showOnlySelected
      },
      set(value) {
        this.selectRoom({ id: this.room.id, showOnlySelected: value })
      },
    },
  },
  methods: {
    ...mapMutations('outlay', ['selectRoom']),
    openMenu(e) {
      this.$refs.menu.toggle(e)
    },
  },
}
</script>

<template>
  <div class="room-item" :class="{ active }">
    <Menu ref="menu" :model="items" :popup="true" />
    <span class="room-item__title"> {{ room.name }} </span>
    <div class="room-item__actions" @click.stop>
      <Checkbox v-model="viewMode" :binary="true" />
      <Button class="p-button-text" icon="pi pi-ellipsis-h" @click="openMenu" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  background-color: #607d8b;
  cursor: pointer;
  height: 40px;
  min-height: 40px;
  overflow: hidden;

  &__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    color: v-bind(textColor);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &.active {
    background-color: #00afec;
  }
}

::v-deep(.p-button-text) {
  color: v-bind(textColor) !important;
}

::v-deep(.p-button) {
  .p-button-label {
    display: none;
  }
}
</style>
