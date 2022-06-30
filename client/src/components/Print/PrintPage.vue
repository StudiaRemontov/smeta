<script>
import { mapGetters } from 'vuex'

import PrintTable from './PrintTable.vue'
import PageHeader from './Room/PageHeader.vue'
import ResultsTable from '@/components/Outlay/BodyRow/CenterSide/Results/ResultsTable.vue'
import AppLogo from '@/components/UI/AppLogo.vue'

export default {
  components: { PrintTable, PageHeader, ResultsTable, AppLogo },
  props: {
    outlay: {
      required: true,
      type: Object,
    },
  },
  emits: ['mounted'],
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
  mounted() {
    this.$emit('mounted')
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
    <div class="results-table">
      <div class="top">
        <AppLogo class="top__logo" />
        <div class="top__text">
          <span class="top__phone"> 8 (495) 104-51-21 </span>
          <span class="top__subtext">служба технического контроля</span>
        </div>
      </div>
      <span class="title"> Сводная таблица </span>

      <ResultsTable />
    </div>
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

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__text {
    color: #00afec;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  &__phone {
    font-weight: 700;
    font-size: 27px;
  }

  &__subtext {
    font-size: 14px;
    font-weight: 700;
  }

  &__logo {
    max-width: 150px;
    width: 100%;
  }
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
