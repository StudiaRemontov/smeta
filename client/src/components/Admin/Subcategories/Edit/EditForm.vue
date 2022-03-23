<script>
import JobTable from '../JobTable.vue'
import { mapActions } from 'vuex'

export default {
  components: { JobTable },
  props: {
    subcategory: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      name: '',
      jobs: [],
    }
  },
  methods: {
    ...mapActions('subcategory', ['update']),
    createRow() {
      const row = {
        name: '',
        price: 0,
        unit: '',
        id: Date.now(),
      }
      this.jobs.push(row)
    },
    async submitHandler() {
      const data = {
        name: this.name,
        jobs: this.jobs,
      }

      try {
        await this.update({ id: this.subcategory._id, data })
      } catch (error) {
        console.log(error)
      }
    },
    removeJob(id) {
      this.jobs = this.jobs.filter(job => job.id !== id)
    },
  },
  mounted() {
    const clone = JSON.parse(JSON.stringify(this.subcategory))
    this.name = clone.name
    this.jobs = clone.jobs
  },
}
</script>

<template>
  <form class="subcategory-form form" @submit.prevent>
    <div class="form__group">
      <label class="form__label"> Название </label>
      <input
        v-model="name"
        class="form__input input"
        placeholder="Название"
        type="text"
      />
    </div>

    <div class="subcategory-form__form">
      <div class="subcategory-form__header">
        <span class="subcategory-form__title"> Список работ </span>
        <AppButton variant="success" @click="createRow">+</AppButton>
      </div>
      <JobTable :data="jobs" @remove="removeJob" />
    </div>
    <AppButton variant="primary" @click="submitHandler">Изменить</AppButton>
  </form>
</template>

<style lang="scss" scoped>
.subcategory-form {
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
</style>
