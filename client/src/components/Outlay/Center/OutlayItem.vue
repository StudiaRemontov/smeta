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
  },
}
</script>

<template>
  <div class="outlay-item" :class="{ active: isActive }" @click="selectOutlay">
    <span class="outlay-item__name"> {{ outlay.name }}</span>
  </div>
</template>

<style lang="scss" scoped>
.outlay-item {
  border: 1px solid #a7a7a7;
  padding: 10px;
  cursor: pointer;

  &.active {
    color: #2196f3;
    border: 1px #2196f3 solid;
  }
}
</style>
