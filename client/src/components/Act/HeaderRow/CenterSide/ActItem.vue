<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    act: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters('acts', {
      selected: 'act',
    }),
    isSelected() {
      return this.selected?._id === this.act._id
    },
    date() {
      return new Date(this.act.createdAt).toLocaleDateString()
    },
  },
  methods: {
    ...mapActions('acts', ['setAct']),
    selectAct() {
      this.setAct(this.act)
    },
    openMenu(e) {
      this.$emit('open-menu', e, this.act._id)
    },
  },
}
</script>

<template>
  <div class="act-item" :class="{ selected: isSelected }" @click="selectAct">
    <div class="act-item__text">
      <div class="act-item__date">от {{ date }}</div>
      <span class="act-item__name" :title="act.name"> {{ act.name }}</span>
    </div>
    <button class="button" @click.stop="openMenu">
      <i class="pi pi-ellipsis-h icon"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
$dot-size: 7px;

.act-item {
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
  padding: 7px 15px;
  padding-left: 7px;

  &.selected {
    color: #28c430;
    border: 1px #28c430 solid;
  }

  .icon {
    color: #808080;
  }

  &.selected .icon {
    color: #28c430;
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
    color: #808080;
  }

  &__date {
    font-size: 11px;
    color: #808080;
  }
}
</style>
