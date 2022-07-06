<script>
import { mapGetters, mapState } from 'vuex'

import roomParameters from '@/mixins/roomParameters.mixin'
import { isObjectId } from '@/helpers/isObjectId'
import { filterNodes } from '@/store/modules/outlay.module'
import { formatNumber } from '@/helpers/formatNumber'
import categoriesWithoutSale from '@/enum/categoriesWithoutSale'

import { uniqBy } from 'lodash'
import prulal from 'plural-ru'

export default {
  mixins: [roomParameters],
  computed: {
    ...mapState('outlay', ['selectedValues']),
    ...mapGetters('outlay', [
      'rooms',
      'roomsData',
      'quantityKey',
      'priceKey',
      'keys',
      'sale',
    ]),
    roomList() {
      return [...this.rooms].reverse()
    },
    parameters() {
      return {
        perimeter: this.roomOptions.perimeter,
        floorArea: this.roomOptions.floorArea,
        wallArea: this.roomOptions.wallArea,
      }
    },
    roomParameters() {
      return this.roomList.map(r => {
        const { options, id } = r
        const { computed } = this.calculateAllParameters(options)
        return {
          id,
          computed,
        }
      })
    },
    totalParameters() {
      return this.roomList.reduce((acc, room) => {
        const { options } = room
        const { computed } = this.calculateAllParameters(options)
        return this.sumParameters(acc, computed)
      }, {})
    },
    categories() {
      const categories = this.roomList.reduce((acc, room) => {
        return [...acc, ...room.jobs]
      }, [])
      const uniqCategories = uniqBy(categories, 'key')
      const roomsClone = JSON.parse(JSON.stringify(this.roomsData))

      return uniqCategories.map(c => {
        const sumOfMontage = this.roomList.reduce((acc, room) => {
          const selected = this.selectedValues[room.id]
          const values = roomsClone[room.id]
          const nodes = values.map(v => filterNodes(v, selected))
          const category = nodes.find(n => n.key === c.key)
          if (!category) {
            acc[room.id] = 0
            return acc
          }
          const specMontage = this.getOnlyMontage(category)
          const onlyMontage = specMontage.map(this.treeToListOnlyValues).flat()
          const sum = onlyMontage.reduce((s, node) => {
            const { data } = node
            const jobSum = data[this.quantityKey.id] * data[this.priceKey.id]
            s += jobSum
            return s
          }, 0)
          acc[room.id] = sum
          return acc
        }, {})

        const sumOfCategoryInRooms = this.roomList.reduce((acc, room) => {
          const selected = this.selectedValues[room.id]
          const values = roomsClone[room.id]
          const nodes = values.map(v => filterNodes(v, selected))
          const category = nodes.find(n => n.key === c.key)
          if (!category) {
            acc[room.id] = 0
            return acc
          }

          const selectedItems = this.getSelectedItems(
            category.children,
            selected,
          )
          const selectedNodes = selectedItems
            .map(this.treeToListOnlyValues)
            .flat()
          const sum = selectedNodes.reduce((acc, item) => {
            const { data } = item
            const sumData = data[this.quantityKey.id] * data[this.priceKey.id]
            return acc + sumData
          }, 0)
          acc[room.id] = sum - sumOfMontage[room.id]
          return acc
        }, {})

        const totalMontage = Object.values(sumOfMontage).reduce(
          (acc, item) => (acc += item),
          0,
        )

        return {
          id: c.key,
          name: c.data[this.keys[0].id],
          rooms: sumOfCategoryInRooms,
          specMontage: totalMontage,
        }
      })
    },
    sumOfCategory() {
      return this.categories.reduce((acc, category) => {
        acc[category.id] = Object.values(category.rooms).reduce(
          (sum, value) => sum + value,
          0,
        )
        acc[category.id] += category.specMontage
        return acc
      }, {})
    },
    priceOfRooms() {
      return this.roomList.map(r => {
        const result = this.categories.reduce((acc, category) => {
          const sumOfCategory = Object.entries(category.rooms).reduce(
            (sum, [key, value]) => {
              if (key === r.id) {
                sum += value
              }
              return sum
            },
            0,
          )
          acc += sumOfCategory
          return acc
        }, 0)

        return {
          id: r.id,
          result: result,
        }
      })
    },
    priceOfRoomsWithSale() {
      return this.priceOfRooms.map(r => {
        const saleValue = (r.result / 100) * this.sale
        const priceWithSale = r.result - saleValue
        return {
          ...r,
          result: priceWithSale,
        }
      })
    },
    totalPrice() {
      return this.priceOfRooms.reduce((acc, room) => {
        acc += room.result
        return acc
      }, 0)
    },
    totalPriceWithSale() {
      const saleValue = (this.totalPrice / 100) * this.sale
      return this.totalPrice - saleValue
    },
    specMontage() {
      const categories = this.roomList.reduce((acc, room) => {
        return [...acc, ...room.jobs]
      }, [])
      const onlySpecMontage = categories.map(this.getOnlyMontage).flat()
      const values = onlySpecMontage.map(this.treeToListOnlyValues).flat()
      const sum = values.reduce((acc, node) => {
        const { data } = node
        const jobSum = data[this.quantityKey.id] * data[this.priceKey.id]
        acc += jobSum
        return acc
      }, 0)
      return sum
    },
    workTime() {
      const priceForDay = this.getPriceForDay(
        this.totalPrice + this.specMontage,
      )
      const days = Math.ceil(this.totalPrice / priceForDay)
      return days
    },
    subTableData() {
      const saleValue = (this.totalPrice / 100) * this.sale
      const dayString = prulal(this.workTime, 'день', 'дня', 'дней')
      return [
        {
          text: 'Стоимость без учета скидки',
          value: this.format(this.totalPrice + this.specMontage),
          render: this.sale && this.specMontage > 0,
        },
        {
          text: 'Стоимость общестр-х работ',
          value: this.format(this.totalPrice),
          render: this.sale || this.specMontage,
        },
        {
          text: 'Скидка на общестр-е работы',
          value: `${this.sale} %`,
          render: this.sale > 0,
        },
        {
          text: 'Сумма скидки на общестр-е работы',
          value: this.format(saleValue),
          render: this.sale > 0,
        },
        {
          text: 'Общестр-е работы с учетом скидки',
          value: this.format(this.totalPriceWithSale),
          render: this.sale > 0 && this.specMontage,
        },
        {
          text: 'Спецмонтаж',
          value: this.format(this.specMontage),
          render: this.specMontage > 0,
        },
        {
          text: 'Итого сметная стоимость',
          value: this.format(this.totalPriceWithSale + this.specMontage),
          render: true,
        },
        {
          text: 'Срок выполнения работ',
          value: `${this.workTime} ${dayString}`,
          render: true,
        },
      ]
    },
  },
  methods: {
    sumParameters(obj1, obj2) {
      return Object.entries(obj2).reduce((props, [key, value]) => {
        const sum = value + (obj1[key] || 0)
        props[key] = sum
        return props
      }, {})
    },
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (isObjectId(key)) {
        return childs
      }

      return [node]
    },
    getSelectedItems(subcategories, selected) {
      return subcategories.filter(value => selected.includes(value.key))
    },
    format(number) {
      return formatNumber(number)
    },
    getOnlyMontage(node) {
      let returnData = []
      const { data, children } = node
      const name = data[this.keys[0].id]
      if (categoriesWithoutSale.includes(name)) {
        returnData.push(node)
      }
      const subItems = children.map(this.getOnlyMontage).flat()
      returnData = [...returnData, ...subItems]
      return returnData
    },
    getPriceForDay(totalSum) {
      if (totalSum >= 100000 && totalSum < 300000) {
        return 5100
      }
      if (totalSum >= 300000 && totalSum < 600000) {
        return 6900
      }
      if (totalSum >= 600000 && totalSum < 1000000) {
        return 8000
      }
      if (totalSum >= 1000000 && totalSum < 2000000) {
        return 10000
      }
      if (totalSum >= 2000000) {
        return 13000
      }
      return 5100
    },
  },
}
</script>

<template>
  <div class="table-wrapper">
    <table class="results-table">
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">Параметры</th>
        <th v-for="room in roomList" :key="room.id" class="results-table__cell">
          {{ room.name }}
        </th>
        <th v-if="specMontage > 0" class="results-table__cell">Спецмонтаж</th>
        <th class="results-table__cell">Итого</th>
      </tr>
      <tr
        v-for="(val, key) in parameters"
        :key="key"
        class="results-table__row"
      >
        <td class="results-table__cell">
          {{ val }}
        </td>
        <td
          v-for="room in roomParameters"
          :key="room.id"
          class="results-table__cell"
        >
          {{ room.computed[val] }}
        </td>
        <td v-if="specMontage > 0" class="results-table__cell">-</td>
        <td class="results-table__cell bold">
          {{ totalParameters[val] }}
        </td>
      </tr>
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">Наименование работ</th>
        <th v-for="room in roomList" :key="room.id" class="results-table__cell">
          {{ room.name }}
        </th>
        <th v-if="specMontage > 0" class="results-table__cell">Спецмонтаж</th>
        <th class="results-table__cell">Итого</th>
      </tr>
      <tr
        v-for="category in categories"
        :key="category.id"
        class="results-table__table__row"
      >
        <td class="results-table__cell">
          {{ category.name }}
        </td>
        <td
          v-for="(val, key) in category.rooms"
          :key="key"
          class="results-table__cell price"
        >
          {{ format(val) }}
        </td>
        <td v-if="specMontage > 0" class="results-table__cell">
          {{ format(category.specMontage) }}
        </td>
        <td class="results-table__cell bold price">
          {{ format(sumOfCategory[category.id]) }}
        </td>
      </tr>
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">ИТОГО ПО РАБОТАМ</th>
        <th
          v-for="price in priceOfRooms"
          :key="price.id"
          class="results-table__cell price"
        >
          {{ format(price.result) }}
        </th>
        <th v-if="specMontage > 0" class="results-table__cell price">
          {{ format(specMontage) }}
        </th>
        <th class="results-table__cell price">
          {{ format(totalPrice + specMontage) }}
        </th>
      </tr>
      <tr v-if="sale" class="results-table__row results-table__row--head">
        <th class="results-table__cell">ИТОГО СО СКИДКОЙ</th>
        <th
          v-for="price in priceOfRoomsWithSale"
          :key="price.id"
          class="results-table__cell price"
        >
          {{ format(price.result) }}
        </th>
        <th v-if="specMontage > 0" class="results-table__cell price">
          {{ format(specMontage) }}
        </th>
        <th class="results-table__cell price">
          {{ format(totalPriceWithSale + specMontage) }}
        </th>
      </tr>
    </table>
    <table class="subtable">
      <template v-for="item in subTableData" :key="item.text">
        <tr v-if="item.render" class="subtable__row">
          <td class="subtable__cell">
            {{ item.text }}
          </td>
          <td class="subtable__cell bold price">
            {{ item.value }}
          </td>
        </tr>
      </template>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  @media print {
    display: block;
  }
}

.results-table {
  border-collapse: collapse;
  display: block;

  @media print {
    margin-top: 10px;
  }

  &__row {
    -webkit-print-color-adjust: exact;
    break-inside: avoid;
    &--head {
      background-color: #ccc;
    }
  }

  &__cell {
    text-align: left;
    padding: 8px;
    border: 1px solid rgb(179, 179, 179);
  }

  &__cell:not(:first-child) {
    text-align: center;
  }
}

.subtable {
  border-collapse: collapse;
  display: block;

  @media print {
    margin-top: 10px;
  }

  &__row {
    break-inside: avoid;
  }

  &__cell {
    &:not(:first-child) {
      text-align: center;
    }
    padding: 8px;
    border: 1px solid rgb(179, 179, 179);
  }
}

.bold {
  font-weight: 700;
}

.price {
  text-align: right !important;
}
</style>
