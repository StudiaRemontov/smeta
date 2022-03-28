<script>
export default {
  props: {
    title: String,
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
  },
}
</script>

<template>
  <transition name="fade">
    <div class="backdrop" @click="closeModal">
      <div class="app-modal" @click.stop>
        <div class="app-modal__header">
          <span class="app-modal__title">
            {{ title }}
          </span>
          <AppButton class="app-modal__button" @click="closeModal">
            &times;
          </AppButton>
        </div>
        <div class="app-modal__body">
          <slot name="body" />
        </div>
        <div class="app-modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(104, 104, 104, 0.438);
  display: flex;
}

.app-modal {
  max-width: 600px;
  width: 90%;
  min-width: 300px;
  min-height: 150px;
  margin: auto;
  border-radius: 5px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__body {
    flex: 1;
  }

  &__title {
    font-weight: 600;
  }

  &__button {
    padding: 10px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
