<script>
import OutlayItem from './OutlayItem.vue'
import Menu from 'primevue/menu'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    OutlayItem,
    Menu,
  },
  data() {
    return {
      selectedItem: null,
    }
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    selectedOutlay() {
      return this.outlays.find(o => o._id === this.selectedItem)
    },
    items() {
      return [
        {
          label: 'Сделать активной',
          command: async () => {
            try {
              await this.setActive(this.selectedItem)
            } catch (error) {
              console.log(error)
            }
          },
          disabled: this.selectedOutlay?.active,
        },
        {
          label: 'Клонировать',
          command: async () => {
            const outlay = this.outlays.find(o => o._id === this.selectedItem)
            const clone = JSON.parse(JSON.stringify(outlay))
            const data = {
              ...clone,
              active: false,
              date: undefined,
              _id: undefined,
            }
            try {
              await this.create(data)
            } catch (error) {
              console.log(error)
            }
          },
          disabled: false,
        },
        {
          label: 'Удалить',
          command: async () => {
            try {
              await this.remove(this.selectedItem)
            } catch (error) {
              console.log(error)
            } finally {
              this.selectedItem = null
            }
          },
          disabled: false,
        },
      ]
    },
    outlayList() {
      return [...this.outlays].reverse()
    },
  },
  methods: {
    ...mapActions('outlays', ['create', 'remove', 'setActive']),
    openMenu(e, id) {
      this.selectedItem = id
      this.$refs.menu.toggle(e)
    },
  },
}
</script>

<template>
  <Menu ref="menu" :model="items" :popup="true" />
  <div v-if="outlays && outlays.length > 0" class="outlay-list">
    <OutlayItem
      v-for="outlay in outlayList"
      :key="outlay._id"
      :outlay="outlay"
      @open-menu="openMenu"
    />
  </div>
</template>

<style lang="scss" scoped>
.outlay-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  overflow-y: hidden;
  @include darkScroll;
}
</style>
