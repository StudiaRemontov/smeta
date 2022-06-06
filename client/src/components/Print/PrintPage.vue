<script>
import { mapGetters } from 'vuex'

import PrintTable from './PrintTable.vue'
import PageHeader from './Room/PageHeader.vue'
import ResultsTable from '@/components/Outlay/BodyRow/CenterSide/Results/ResultsTable.vue'

export default {
  components: { PrintTable, PageHeader, ResultsTable },
  props: {
    outlay: {
      required: true,
      type: Object,
    },
  },
  computed: {
    ...mapGetters('outlay', ['keys']),
    tableKeys() {
      if (!this.edition) return []

      const keys = [
        ...this.keys,
        {
          id: 'Сумма',
          name: 'Сумма',
        },
      ]

      return keys
    },
    tableData() {
      return [...this.outlay.rooms].reverse()
    },
  },
}
</script>

<template>
  <div class="container">
    <div v-for="room in tableData" class="room" :key="room.id">
      <PageHeader :room="room" />
      <span class="title">{{ room.name }}</span>
      <PrintTable :tableKeys="keys" :tableData="room.jobs" :room="room" />
      <div class="signs">
        <span class="sign">
          Составлено:
          <div class="sign__underline"></div>
        </span>
        <div class="sign">
          Согласовано:
          <div class="sign__underline"></div>
        </div>
      </div>
    </div>
    <span class="title results-table"> Сводная таблица </span>
    <ResultsTable />
  </div>
</template>

<style lang="scss" scoped>
.signs {
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
}

.sign {
  font-size: 11px;
  font-weight: 700;
  display: flex;

  &__underline {
    border-bottom: 1px black solid;
    width: 75px;
    margin: 0px 4px;
    position: relative;

    &::after {
      content: 'подпись';
      position: absolute;
      font-size: 10px;
      font-weight: 400;
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(2px);
      font-style: italic;
    }
  }
}

.container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  font-family: 'Times New Roman';
}

.room {
  page-break-before: always;
}

.title {
  display: block;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin-top: 20px;
}

.results-table {
  page-break-before: always;
}
</style>

<style>
@media print {
  body {
    background-color: #fff !important;
    overflow: auto !important;
    font-family: 'Times New Roman';
  }
}
</style>
