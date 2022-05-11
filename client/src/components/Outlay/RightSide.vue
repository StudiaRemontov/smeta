<script>
import NotificationButton from '@/components/UI/NotificationButton.vue'
import UserAvatar from '@/components/UI/UserAvatar.vue'
import RoomList from '@/components/Outlay/RightSide/RoomList.vue'

import InputNumber from 'primevue/inputnumber'
import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    NotificationButton,
    UserAvatar,
    InputNumber,
    RoomList,
  },
  data() {
    return {
      sale: 0,
      timeout: null,
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
        const parents = nodes.filter(n => !n.parent)

        const jobs = parents.map(p => this.convertData(p, nodes))
        const vals = jobs.map(category => {
          const values = this.treeToListOnlyValues(category)
          const sum = values.reduce((acc, val) => (acc += val.sum), 0)
          return {
            name: category.data[this.keys[0].id],
            sum,
          }
        })
        const sumOfRoom = vals.reduce((acc, val) => (acc += val.sum), 0)
        return {
          name: room.name,
          jobs: vals,
          sum: sumOfRoom,
        }
      })
    },
    totalSum() {
      return this.data.reduce((acc, val) => acc + val.sum, 0)
    },
    totalSumWithSale() {
      if (!this.sale) return this.totalSum
      const saleValue = (this.totalSum / 100) * this.sale
      const result = this.totalSum - saleValue
      return result.toFixed(2)
    },
  },
  methods: {
    isObjectId(id) {
      return /^[0-9a-fA-F]{24}$/.test(id)
    },
    convertData(node, selected) {
      const { key, data } = node
      const children = selected.filter(n => n?.parent === node.key)
      if (children.length > 0) {
        const subChildren = children.map(c => this.convertData(c, selected))
        return {
          key,
          data,
          children: subChildren,
        }
      }
      const sum = data[this.quantityKey.id] * data[this.priceKey.id]
      return {
        key,
        data,
        children,
        sum,
      }
    },
    treeToListOnlyValues(node) {
      const { children, key } = node
      const childs = children.map(this.treeToListOnlyValues).flat()
      if (this.isObjectId(key)) {
        return childs
      }
      return [...childs, node]
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
          Без скидки: <span class="result"> {{ totalSum }}</span>
        </span>
        <div class="right-side__sale">
          <span>Скидка (%):</span>
          <InputNumber
            v-model="sale"
            placeholder="%"
            :format="false"
            :min="0"
            :max="100"
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
  background-color: rgb(208, 255, 0);
  font-weight: 600;

  &--sale {
    background-color: rgb(30, 255, 0);
  }
}

::v-deep(.p-inputnumber) {
  .p-inputnumber-input {
    max-width: 100%;
    width: 100%;
  }
  width: 50px;
}
</style>
