<script>
import NotificationButton from '@/components/UI/NotificationButton.vue'
import UserAvatar from '@/components/UI/UserAvatar.vue'
import InputText from 'primevue/inputtext'

export default {
  components: {
    NotificationButton,
    UserAvatar,
    InputText,
  },
}
</script>

<template>
  <div class="right-side">
    <div class="right-side__header">
      <NotificationButton />
      <AppButton>
        <UserAvatar />
      </AppButton>
    </div>
    <div class="right-side__parameters">
      <span> Расчеты </span>
      <div class="right-side__rooms">
        <div class="right-side__room">
          <div class="right-side__room-head">
            <span class="right-side__room-name"> Комната 2 </span>
            <span class="right-side__room-price"> 65 </span>
          </div>
          <div class="right-side__rooms">
            <div class="right-side__room">
              <div class="right-side__room-head">
                <span class="right-side__room-name"> Комната 2 </span>
                <span class="right-side__room-price"> 65 </span>
              </div>
            </div>
            <div class="right-side__room">
              <div class="right-side__room-head">
                <span class="right-side__room-name"> Комната 2 </span>
                <span class="right-side__room-price"> 65 </span>
              </div>
            </div>
          </div>
        </div>
        <div class="right-side__room">
          <div class="right-side__room-head">
            <span class="right-side__room-name"> Комната 2 </span>
            <span class="right-side__room-price"> 65 </span>
          </div>
          <div class="right-side__rooms">
            <div class="right-side__room">
              <div class="right-side__room-head">
                <span class="right-side__room-name"> Комната 2 </span>
                <span class="right-side__room-price"> 65 </span>
              </div>
            </div>
            <div class="right-side__room">
              <div class="right-side__room-head">
                <span class="right-side__room-name"> Комната 2 </span>
                <span class="right-side__room-price"> 65 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-side__results">
        <span> Без скидки: 2000 </span>
        <div class="right-side__sale">
          <span>Скидка (%):</span>
          <InputText placeholder="%" />
        </div>
        <span> Итого: 2000 </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$header-height: 55px;

.right-side {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__header {
    height: $header-height;
    padding: 10px;
    padding-right: 30px;
    display: flex;
    gap: 15px;
    align-items: center;
    justify-content: flex-end;
    background-color: $color-dark;
  }

  &__parameters {
    margin: 0 10px;
    background-color: $color-light;
    padding: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__rooms {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 10px;
  }

  &__room {
    &-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  &__results {
    border-top: 1px #ccc solid;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  &__sale {
    display: flex;
    align-items: center;

    input {
      width: 50px;
    }
  }
}
</style>
