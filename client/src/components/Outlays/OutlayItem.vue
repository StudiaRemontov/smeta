<script>
import AppDropdown from '@/components/UI/AppDropdown.vue'
import ThreeDotsIcon from '../UI/Icons/ThreeDotsIcon.vue'

export default {
  components: {
    AppDropdown,
    ThreeDotsIcon,
  },
  props: {
    outlay: {
      type: Object,
      default: () => ({}),
      required: true,
    },
  },
  data() {
    return {
      items: [
        {
          text: 'Добавить акты',
          handler: () => {
            this.$router.push(`/outlay/${this.outlay._id}/acts`)
          },
        },
      ],
    }
  },
  methods: {
    openFolder() {
      this.$router.push(`/outlay/2`)
    },
  },
}
</script>

<template>
  <li class="outlay-item" @dblclick="openFolder">
    <div class="outlay-item__header">
      <span class="outlay-item__name"> {{ outlay.name }} </span>
      <AppDropdown ref="dropdown" :items="items">
        <ThreeDotsIcon />
      </AppDropdown>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.outlay-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #808080;
  border-radius: 10px;
  padding: 25px 15px 15px;

  &__header {
    display: flex;
    justify-content: space-between;
  }

  &__name {
    font-size: $font-medium;
    font-weight: 700;
    word-break: break-word;
    user-select: auto;
  }
}
</style>
