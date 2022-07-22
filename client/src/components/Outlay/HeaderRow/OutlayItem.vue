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
    isSelected() {
      return this.selected?._id === this.outlay._id
    },
    date() {
      return new Date(this.outlay.createdAt).toLocaleDateString()
    },
    color() {
      return this.isSelected ? '#00afec' : '#fff'
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
  <div
    class="outlay-item"
    :class="{ selected: isSelected, active: outlay.active }"
    @click="selectOutlay"
  >
    <div class="outlay-item__dot-wrapper">
      <div v-if="outlay.active" class="outlay-item__dot"></div>
    </div>
    <div class="outlay-item__text">
      <div class="outlay-item__date">от {{ date }}</div>
      <span class="outlay-item__name" :title="outlay.name">
        {{ outlay.name }}</span
      >
    </div>
    <button class="button" @click.stop="openMenu">
      <i class="pi pi-ellipsis-h icon"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
$dot-size: 7px;

.outlay-item {
  position: relative;
  border: 1px solid v-bind(color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  border-radius: 10px;
  min-width: 130px;
  max-width: 130px;
  height: 40px;
  padding: 7px 15px;
  padding-left: 7px;

  .icon {
    color: v-bind(color);
  }

  &__text {
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  &__dot {
    width: 100%;
    height: 100%;
    background-color: #28c430;
    border-radius: 50%;

    &-wrapper {
      width: $dot-size;
      height: $dot-size;
    }
  }

  &__name {
    position: relative;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: 400;
    line-height: 15px;
    color: v-bind(color);
  }

  &__date {
    font-size: 11px;
    color: v-bind(color);
  }
}
</style>
