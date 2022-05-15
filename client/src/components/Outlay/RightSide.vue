<script>
import NotificationButton from '@/components/UI/NotificationButton.vue'
import UserAvatar from '@/components/UI/UserAvatar.vue'
import RoomList from '@/components/Outlay/RightSide/RoomList.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    NotificationButton,
    UserAvatar,
    RoomList,
  },
  data() {
    return {
      sale: 0,
    }
  },
  computed: {
    ...mapState('outlay', ['selectedValues']),
    ...mapGetters('outlay', [
      'outlay',
      'rooms',
      'roomsData',
      'quantityKey',
      'priceKey',
      'keys',
    ]),
    data() {
      const roomsClone = JSON.parse(
        JSON.stringify(Object.entries(this.roomsData)),
      )

      return roomsClone.map(([roomId, values]) => {
        const room = this.rooms.find(r => r.id === roomId)
        const nodes = values.filter(value =>
          this.selectedValues[roomId].includes(value.key),
        )

        const vals = nodes.map(category => {
          const values = this.treeToListOnlyValues(category)
          const selectedValues = values.filter(v =>
            this.selectedValues[roomId].includes(v.key),
          )

          const sum = selectedValues
            .reduce((acc, val) => {
              const sum =
                val.data[this.quantityKey.id] * val.data[this.priceKey.id]

              return acc + sum
            }, 0)
            .toFixed(2)

          return {
            name: category.data[this.keys[0].id],
            sum,
          }
        })
        const sumOfRoom = vals
          .reduce((acc, val) => (acc += +val.sum), 0)
          .toFixed(2)
        return {
          name: room.name,
          jobs: vals,
          sum: sumOfRoom,
        }
      })
    },
    totalSum() {
      return this.data.reduce((acc, val) => acc + +val.sum, 0)
    },
    totalSumFormatted() {
      return this.totalSum.toFixed(2).toLocaleString()
    },
    totalSumWithSale() {
      if (!this.sale || this.sale < 0 || this.sale > 20) {
        return this.totalSumFormatted
      }
      const saleValue = (this.totalSum / 100) * this.sale
      const result = (this.totalSum - saleValue).toFixed(2)
      return result.toLocaleString()
    },
  },
  methods: {
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()

      if (this.isObjectId(key)) {
        return childs
      }

      return [node]
    },
    changeSale(e) {
      const value = e.target.valueAsNumber
      if (isNaN(value) || value < 0) {
        return (this.sale = 0)
      }
      if (value > 20) {
        return (this.sale = 20)
      }
    },
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
    <div v-if="outlay" class="right-side__parameters">
      <span> Расчеты </span>
      <RoomList :rooms="data" />
      <div class="right-side__results">
        <span>
          Без скидки: <span class="result"> {{ totalSumFormatted }}</span>
        </span>
        <div class="right-side__sale">
          <span>Скидка (%):</span>
          <input
            v-model="sale"
            placeholder="%"
            type="number"
            :max="20"
            :min="0"
            @change="changeSale"
          />
        </div>
        <span>
          Итого:
          <span class="result result--sale">
            {{ totalSumWithSale }}
          </span>
        </span>
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
    padding: 20px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
  }

  &__results {
    border-top: 1px #ccc solid;
    padding: 10px 0;
    display: flex;
    gap: 15px;
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

.result {
  padding: 5px;
  font-weight: 600;
}
</style>
