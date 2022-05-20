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
    date() {
      return new Date(this.outlay.date).toLocaleDateString()
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
    <div class="outlay-item__date">от {{ date }}</div>
    <span class="outlay-item__name"> {{ outlay.name }}</span>
    <button class="button" @click.stop="openMenu">
      <i class="pi pi-ellipsis-h icon"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
$dot-size: 7px;
$padding-x: 15px;

.outlay-item {
  position: relative;
  border: 1px solid #a7a7a7;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  border: 1px solid #808080;
  border-radius: 10px;
  min-width: 130px;
  max-width: 130px;
  height: 40px;
  padding: 7px $padding-x;

  &.active {
    color: #28c430;
    border: 1px #28c430 solid;
  }

  &.active .icon {
    color: #28c430;
  }

  &__name {
    position: relative;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    // &::before {
    //   content: '';
    //   position: absolute;
    //   width: $dot-size;
    //   height: $dot-size;
    //   background-color: #28c430;
    //   border-radius: 50%;
    //   left: -$dot-size;
    //   transform: translate(-50%, 50%);
    // }
  }

  &__date {
    position: absolute;
    transform: translateY(-100%);
    font-size: 11px;
  }
}
</style>
