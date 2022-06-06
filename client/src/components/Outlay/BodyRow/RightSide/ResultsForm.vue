<script>
import { formatNumber } from '@/helpers/formatNumber'
import categoriesWithoutSale from '@/enum/categoriesWithoutSale'
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      timeout: null,
    }
  },
  computed: {
    ...mapGetters('outlay', ['sale']),
    saleValue: {
      get() {
        return this.sale
      },
      set(value) {
        this.setSale(value)
      },
    },
    totalSum() {
      return this.data.reduce((acc, val) => acc + +val.sum, 0)
    },
    totalSumFormatted() {
      return formatNumber(this.totalSum)
    },
    totalSumWithSale() {
      if (!this.saleValue || this.saleValue < 0 || this.saleValue > 20) {
        return this.totalSumFormatted
      }
      const categoriesWoutSale = this.data
        .map(this.findCategoriesWithoutSale)
        .flat()
      if (categoriesWoutSale.length > 0) {
        const sumOfCategories = categoriesWoutSale.reduce(
          (acc, job) => (acc += job.sum),
          0,
        )
        const sumForSale = this.totalSum - sumOfCategories
        const saleValue = (sumForSale / 100) * this.saleValue
        const result = this.totalSum - saleValue
        return formatNumber(result)
      }
      const saleValue = (this.totalSum / 100) * this.saleValue
      const result = this.totalSum - saleValue
      return formatNumber(result)
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSale']),
    ...mapActions('outlay', ['saveLocaly']),
    inputSale(e) {
      const { target } = e
      const { valueAsNumber } = target
      if (valueAsNumber < 0) {
        target.value = 0
        return
      }
      if (valueAsNumber > 20) {
        target.value = 20
      }
      target.value = this.saleValue
    },
    changeSale() {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(async () => {
        await this.saveLocaly()
      }, 400)
    },
    findCategoriesWithoutSale(node) {
      const { name, jobs } = node
      let returnData = []
      if (categoriesWithoutSale.includes(name)) {
        returnData.push(node)
      }
      if (jobs) {
        const subJobs = jobs.map(this.findCategoriesWithoutSale).flat()
        returnData = [...returnData, ...subJobs]
      }
      return returnData
    },
  },
}
</script>

<template>
  <div class="results">
    <span>
      Без скидки: <span class="result"> {{ totalSumFormatted }}</span>
    </span>
    <div class="right-side__sale">
      <span>Скидка, %: </span>
      <input
        v-model="saleValue"
        class="input"
        placeholder="%"
        type="number"
        :max="20"
        :min="0"
        @input="inputSale"
        @change="changeSale"
      />
    </div>
    <span>
      ИТОГО:
      <span class="result result--sale">
        {{ totalSumWithSale }}
      </span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.results {
  height: 121px;
  padding: 15px 12px;
  border-top: 1px solid #a7a7a7;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.result {
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;

  &--sale {
    background: #fff50f;
    border-radius: 5px;
    padding: 4px;
  }
}

.input {
  text-align: center;
  border: 1px solid #a7a7a7;
  border-radius: 5px;
  font-size: 12px;
  padding: 2px 12px;
}
</style>
