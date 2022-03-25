<script>
export default {
  props: {
    rowData: {
      type: Object,
      required: true,
    },
    rowIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isJobsVisible: false,
    }
  },
  computed: {
    jobs() {
      return this.rowData.jobs
    },
  },
}
</script>

<template>
  <tr class="table-row">
    <td class="table-cell">
      {{ rowIndex + 1 }}
    </td>
    <td class="table-cell visible">
      <div class="cell-body">
        <div class="cell-body__text">{{ rowData.name }}</div>
        <AppButton
          v-if="rowData.jobs.length > 1"
          class="cell-body__button"
          @click="isJobsVisible = !isJobsVisible"
        >
          {{ isJobsVisible ? '-' : '+' }}
        </AppButton>
      </div>
    </td>
    <td class="table-cell visible">
      <template v-if="isJobsVisible">
        <ul v-for="job in jobs" :key="job._id">
          <li>{{ job.name }}</li>
        </ul>
      </template>
      <span v-else-if="jobs.length > 0">
        {{ jobs[0].name }}
        <span v-if="jobs.length > 1"> и еще {{ jobs.length - 1 }} </span>
      </span>
    </td>
    <td class="table-cell">
      <AppButton
        variant="primary"
        :to="{ name: 'subcategoriesEdit', params: { id: rowData._id } }"
      >
        Редактировать
      </AppButton>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.cell-body {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__text {
    flex: 1;
    word-break: break-all;
  }
}
</style>
