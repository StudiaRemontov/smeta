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
  computed: {
    ...mapGetters('acts', ['actsData']),
    totalSum() {
      return this.data.reduce((acc, val) => acc + +val.sum, 0)
    },
    totalSumFormatted() {
      return formatNumber(this.totalSum)
    },
  },
  methods: {
    ...mapMutations('outlay', ['setSale']),
    ...mapActions('outlay', ['saveLocaly']),
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
      ИТОГО:
      <span class="result result--sale">
        {{ totalSumFormatted }}
      </span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.results {
  padding: 15px 12px;
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
