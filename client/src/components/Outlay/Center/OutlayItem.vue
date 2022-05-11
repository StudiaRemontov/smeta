<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    outlay: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('outlay', {
      selected: 'outlay',
    }),
    isActive() {
      return this.selected?._id === this.outlay._id
    },
  },
  methods: {
    ...mapActions('outlay', ['setOutlay']),
    selectOutlay() {
      this.setOutlay(this.outlay)
    },
    openMenu(e) {
      this.$emit('open-menu', e, this.outlay._id)
    },
  },
}
</script>

<template>
  <div class="outlay-item" :class="{ active: isActive }" @click="selectOutlay">
    <span class="outlay-item__name"> {{ outlay.name }}</span>
    <button class="button" @click.stop="openMenu">
      <i class="pi pi-ellipsis-h"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.outlay-item {
  border: 1px solid #a7a7a7;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  &.active {
    color: #2196f3;
    border: 1px #2196f3 solid;
  }
}

.button {
  display: flex;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  border: none;
}
</style>
