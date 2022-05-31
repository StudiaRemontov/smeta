<script>
import { mapGetters } from 'vuex'

import roomParameters from '@/mixins/roomParameters.mixin'
import { isObjectId } from '@/helpers/isObjectId'
import { filterNodes } from '@/store/modules/outlay.module'
import { formatNumber } from '@/helpers/formatNumber'

import { uniqBy } from 'lodash'

export default {
  mixins: [roomParameters],
  computed: {
    ...mapGetters('outlay', [
      'rooms',
      'roomsData',
      'selectedValues',
      'quantityKey',
      'priceKey',
      'keys',
      'sale',
    ]),
    parameters() {
      return {
        perimeter: this.roomOptions.perimeter,
        floorArea: this.roomOptions.floorArea,
        wallArea: this.roomOptions.wallArea,
      }
    },
    roomParameters() {
      return this.rooms.map(r => {
        const { options, id } = r
        const { computed } = this.calculateAllParameters(options)
        return {
          id,
          computed,
        }
      })
    },
    totalParameters() {
      return this.rooms.reduce((acc, room) => {
        const { options } = room
        const { computed } = this.calculateAllParameters(options)
        return this.sumParameters(acc, computed)
      }, {})
    },
    categories() {
      const categories = this.rooms.reduce((acc, room) => {
        return [...acc, ...room.jobs]
      }, [])
      const uniqCategories = uniqBy(categories, 'key')
      const roomsClone = JSON.parse(
        JSON.stringify(Object.entries(this.roomsData)),
      )

      return uniqCategories.map(c => {
        const sumOfCategoryInRooms = roomsClone.reduce(
          (acc, [roomId, values]) => {
            const selected = this.selectedValues[roomId]
            const nodes = values.map(v => filterNodes(v, selected))
            const category = nodes.find(n => n.key === c.key)
            if (!category) {
              acc[roomId] = 0
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
            acc[roomId] = sum
            return acc
          },
          {},
        )

        return {
          id: c.key,
          name: c.data[this.keys[0].id],
          rooms: sumOfCategoryInRooms,
        }
      })
    },
    sumOfCategory() {
      return this.categories.reduce((acc, category) => {
        acc[category.id] = Object.values(category.rooms).reduce(
          (sum, value) => sum + value,
          0,
        )
        return acc
      }, {})
    },
    priceOfRooms() {
      return this.rooms.map(r => {
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
          result,
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
    subTableData() {
      const saleValue = (this.totalPrice / 100) * this.sale
      return [
        {
          text: 'Стоимость без учета скидки',
          value: this.format(this.totalPrice),
        },
        {
          text: 'Стоимость общестр-х работ',
          value: this.format(this.totalPrice),
        },
        {
          text: 'Скидка на общестр-е работы',
          value: `${this.sale} %`,
        },
        {
          text: 'Скидка на общестр-е работы',
          value: this.format(saleValue),
        },
        {
          text: 'Общестр-е работы с учетом скидки',
          value: this.format(this.totalPriceWithSale),
        },
        {
          text: 'Итого сметная стоимость',
          value: this.format(this.totalPriceWithSale),
        },
        {
          text: 'Срок выполнения работ',
          value: '?',
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
  },
}
</script>

<template>
  <div class="table-wrapper">
    <table class="results-table">
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">Параметры</th>
        <th v-for="room in rooms" :key="room.id" class="results-table__cell">
          {{ room.name }}
        </th>
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
        <td class="results-table__cell bold">
          {{ totalParameters[val] }}
        </td>
      </tr>
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">Наименование работ</th>
        <th v-for="room in rooms" :key="room.id" class="results-table__cell">
          {{ room.name }}
        </th>
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
          class="results-table__cell"
        >
          {{ format(val) }}
        </td>
        <td class="results-table__cell results-table__cell bold">
          {{ format(sumOfCategory[category.id]) }}
        </td>
      </tr>
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">ИТОГО ПО РАБОТАМ</th>
        <th
          v-for="price in priceOfRooms"
          :key="price.id"
          class="results-table__cell"
        >
          {{ format(price.result) }}
        </th>
        <th class="results-table__cell">
          {{ format(totalPrice) }}
        </th>
      </tr>
      <tr class="results-table__row results-table__row--head">
        <th class="results-table__cell">ИТОГО СО СКИДКОЙ</th>
        <th
          v-for="price in priceOfRoomsWithSale"
          :key="price.id"
          class="results-table__cell"
        >
          {{ format(price.result) }}
        </th>
        <th class="results-table__cell">
          {{ format(totalPriceWithSale) }}
        </th>
      </tr>
    </table>
    <table class="subtable">
      <tr v-for="item in subTableData" :key="item.text" class="subtable__row">
        <td class="subtable__cell">
          {{ item.text }}
        </td>
        <td class="subtable__cell bold">
          {{ item.value }}
        </td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.results-table {
  border-collapse: collapse;

  &__row {
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
</style>
