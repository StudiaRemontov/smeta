<script>
import ActItem from './ActItem.vue'
import Menu from 'primevue/menu'

import { mapActions, mapGetters } from 'vuex'

import { actStatus } from '../../../../enum/actStatus'

export default {
  components: {
    ActItem,
    Menu,
  },
  data() {
    return {
      selectedItem: null,
    }
  },
  computed: {
    ...mapGetters('acts', ['acts']),
    actList() {
      return [...this.acts].reverse()
    },
    currentAct() {
      return this.acts.find(a => a._id === this.selectedItem)
    },
    items() {
      return [
        {
          label: 'Удалить',
          command: async () => {
            try {
              await this.remove(this.selectedItem)
            } catch (error) {
              const { response } = error
              const message = response ? response.data.message : error.message
              this.$toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: message,
                life: 3000,
              })
            } finally {
              this.selectedItem = null
            }
          },
          disabled: this.currentAct && this.currentAct.status !== actStatus.NEW,
        },
      ]
    },
  },
  methods: {
    ...mapActions('acts', ['remove']),
    openMenu(e, id) {
      this.selectedItem = id
      this.$refs.menu.toggle(e)
    },
  },
}
</script>

<template>
  <Menu ref="menu" :model="items" :popup="true" />
  <div v-if="acts && acts.length > 0" class="act-list">
    <ActItem
      v-for="act in actList"
      :key="act._id"
      :act="act"
      @open-menu="openMenu"
    />
  </div>
</template>

<style lang="scss" scoped>
.act-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  overflow-y: hidden;
  @include darkScroll;

  &::-webkit-scrollbar {
    height: 5px;
  }
}
</style>
