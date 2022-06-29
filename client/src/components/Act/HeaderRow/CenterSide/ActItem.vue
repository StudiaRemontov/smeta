<script>
import { mapActions, mapGetters } from 'vuex'
import { actStatus } from '../../../../enum/actStatus'

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
    showDot() {
      return this.act.status !== actStatus.NEW
    },
    dotStyle() {
      if (!this.showDot) {
        return {}
      }

      const colors = {
        [actStatus.CONFIRMED]: '#28c430',
        [actStatus.REJECTED]: '#de4848',
      }

      return {
        backgroundColor: colors[this.act.status],
      }
    },
    date() {
      return new Date(this.act.createdAt).toLocaleDateString()
    },
    color() {
      return this.isSelected ? '#00afec' : '#808080'
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
    <div class="act-item__dot-wrapper">
      <div v-if="showDot" class="act-item__dot" :style="dotStyle"></div>
    </div>
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
