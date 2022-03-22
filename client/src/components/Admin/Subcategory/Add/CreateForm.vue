<script>
import JobTable from './CreateForm/JobTable.vue'

export default {
  components: { JobTable },
  data() {
    return {
      name: '',
      jobs: [
        {
          name: '',
          price: 0,
          unit: '',
          id: Date.now(),
        },
      ],
    }
  },
  methods: {
    createRow() {
      const row = {
        name: '',
        price: 0,
        unit: '',
        id: Date.now(),
      }
      this.jobs.push(row)
    },
    submitHandler() {
      const data = {
        name: this.name,
        jobs: this.jobs,
      }
      console.log(data)
    },
    removeJob(id) {
      this.jobs = this.jobs.filter(job => job.id !== id)
    },
  },
}
</script>

<template>
  <form class="create-form form" @submit.prevent>
    <div class="form__group">
      <label class="form__label"> Название </label>
      <input class="form__input input" placeholder="Название" type="text" />
    </div>

    <div class="create-form__form">
      <div class="create-form__header">
        <span class="create-form__title"> Список работ </span>
        <AppButton variant="success" @click="createRow">+</AppButton>
      </div>
      <JobTable :data="jobs" @remove="removeJob" />
    </div>
    <AppButton variant="success" @click="submitHandler">Создать</AppButton>
  </form>
</template>

<style lang="scss" scoped>
.create-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  &__title {
    font-size: $font-medium;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__group {
    display: flex;
    flex-direction: column;
  }

  &__button {
    align-self: flex-start;
  }
}

.input {
  padding: 10px 5px;
  border: none;
  box-shadow: $shadow-dark;
  outline: none;
}
</style>
