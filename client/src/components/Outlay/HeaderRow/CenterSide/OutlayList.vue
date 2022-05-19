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
      items: [
        {
          label: 'Клонировать',
          command: () => {},
        },
        {
          label: 'Удалить',
          command: async () => {
            try {
              await this.remove(this.itemToRemove)
            } catch (error) {
              console.log(error)
            } finally {
              this.itemToRemove = null
            }
          },
        },
      ],
      itemToRemove: null,
    }
  },
  computed: {
    ...mapGetters('outlays', ['outlays']),
    outlayList() {
      return [...this.outlays].reverse()
    },
  },
  methods: {
    ...mapActions('outlays', ['create', 'remove']),
    openMenu(e, id) {
      this.itemToRemove = id
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
