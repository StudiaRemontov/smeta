<script>
import { mapGetters } from 'vuex'

import PrintTable from './PrintTable.vue'
import PageHeader from './PageHeader.vue'

import { filterTreeByQuantity } from '@/store/modules/acts.module'

export default {
  components: { PrintTable, PageHeader },
  props: {
    act: {
      required: true,
      type: Object,
    },
  },
  emits: ['mounted'],
  computed: {
    ...mapGetters('outlay', ['keys', 'outlay', 'quantityKey']),
    ...mapGetters('acts', ['actsData']),
    tableKeys() {
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
    roomData() {
      const allData = JSON.parse(
        JSON.stringify(Object.entries(this.actsData[this.act._id])),
      )
      return allData.reduce((acc, [roomId, values]) => {
        const data = values.filter(filterTreeByQuantity)
        data.forEach(this.replaceQuantity)
        acc[roomId] = data
        return acc
      }, {})
    },
  },
  mounted() {
    this.$emit('mounted')
  },
  methods: {
    replaceQuantity(node) {
      const { data, children } = node

      if (children && children.length > 0) {
        children.forEach(this.replaceQuantity)
      }
      const { quantity } = data
      if (quantity) {
        node.data[this.quantityKey.id] = quantity
      }
    },
  },
}
</script>

<template>
  <div class="container">
    <div v-for="room in tableData" class="room" :key="room.id">
      <PageHeader :act="act" :room="room" />
      <span class="title">{{ room.name }}</span>
      <PrintTable
        :tableKeys="keys"
        :tableData="roomData[room.id]"
        :room="room"
      />
      <div class="text">
        <p>Вышеперечисленные услуги выполнены полностью и в срок.</p>
        <p>
          Заказчик претензий по объему, качеству и срокам оказания услуг не
          имеет
        </p>
      </div>
      <div class="signs">
        <span class="sign">
          Сдал:
          <div class="sign__underline"></div>
          <span>/</span>
          <div class="sign__underline sign__underline--full"></div>
        </span>
        <div class="sign">
          Принял:
          <div class="sign__underline"></div>
          <span>/</span>
          <div class="sign__underline sign__underline--full"></div>
        </div>
      </div>
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

    &--full::after {
      content: 'расшифровка';
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

.text {
  p {
    font-size: 12px;
    font-weight: 700;
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
