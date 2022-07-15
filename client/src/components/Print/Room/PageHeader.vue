<script>
import AppLogo from '@/components/UI/AppLogo.vue'
import { roomOptions } from '@/enum/roomOptions'
import roomParameters from '@/mixins/roomParameters.mixin'
import { formatNumber } from '@/helpers/formatNumber'

export default {
  components: { AppLogo },
  mixins: [roomParameters],
  props: {
    room: {
      type: Object,
      required: true,
    },
  },
  computed: {
    options() {
      return this.room.options
    },
    parameterKeys() {
      const roomParameterLabels = {
        [roomOptions.length]: 'Длина, м/п',
        [roomOptions.width]: 'Ширина, м/п',
        [roomOptions.height]: 'Высота, м/п',
        [roomOptions.spaces]: 'Проем, м2',
      }

      return Object.entries(roomParameterLabels).map(([k, text]) => {
        const key = Object.keys(roomOptions).find(key => roomOptions[key] === k)
        return {
          text,
          key,
        }
      })
    },
    calculatedParameters() {
      if (this.options) {
        return this.calculateAllParameters(this.options)
      }
      return 0
    },
    calculated() {
      if (!this.calculatedParameters) {
        return {}
      }
      return this.calculatedParameters.computed
    },
    calculatedOptions() {
      if (!this.calculatedParameters) {
        return {}
      }
      const { options } = this.calculatedParameters
      return Object.entries(options).reduce((acc, [key, value]) => {
        const newKey = Object.keys(this.roomOptions).find(
          k => this.roomOptions[k] === key,
        )
        acc[newKey] = this.format(value)
        return acc
      }, {})
    },
  },
  methods: {
    format(value) {
      return formatNumber(value)
    },
  },
}
</script>

<template>
  <div class="page-header">
    <div class="top">
      <AppLogo class="top__logo" />
      <div class="top__text">
        <span class="top__phone"> 8 (495) 104-51-21 </span>
        <span class="top__subtext">служба технического контроля</span>
      </div>
    </div>
    <div class="address">
      <span class="text"> Адрес объекта: </span>
      <div class="underline"></div>
    </div>
    <div class="row">
      <div class="row-text">
        <span class="application"
          >Приложение к №1 к договору № КС
          <div class="application__underline"></div>
          от
          <div class="application__underline"></div>
          2022г.</span
        >
        <span class="date">
          Смета от "
          <div class="date__space"></div>
          "
          <div class="date__underline"></div>
          2022
        </span>
      </div>
      <div v-if="options" class="parameters">
        <table class="parameters-table">
          <tr class="parameters-table__row">
            <td
              v-for="parameter in parameterKeys"
              :key="parameter.key"
              class="parameters-table__cell"
            >
              {{ parameter.text }}
            </td>
          </tr>
          <tr class="parameters-table__row">
            <td
              v-for="parameter in parameterKeys"
              :key="parameter.key"
              class="parameters-table__cell"
            >
              {{ calculatedOptions[parameter.key] }}
            </td>
          </tr>
        </table>
        <table class="parameters-table">
          <tr class="parameters-table__row">
            <td
              v-for="(val, key) in calculated"
              :key="key"
              class="parameters-table__cell"
            >
              {{ key }}
            </td>
          </tr>
          <tr class="parameters-table__row">
            <td
              v-for="(val, key) in calculated"
              :key="key"
              class="parameters-table__cell"
            >
              {{ format(val) }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-header {
  break-inside: avoid;
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

.text {
  font-size: 12px;
}

.address {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 5px;
  font-weight: 700;
}

.underline {
  flex: 1;
  border-bottom: 1px black solid;
}

.row {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;

  &-text {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.date {
  font-weight: 700;
  display: flex;
  font-size: 12px;
  white-space: nowrap;

  &__underline {
    border-bottom: 1px black solid;
    width: 50px;
    margin: 0px 4px;
  }

  &__space {
    margin: 0px 4px;
    width: 15px;
  }
}

.application {
  font-weight: 700;
  display: flex;
  font-size: 12px;
  white-space: nowrap;

  &__underline {
    border-bottom: 1px black solid;
    width: 50px;
  }
}

.parameters {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.parameters-table {
  border-collapse: collapse;
  table-layout: fixed;

  &__cell {
    font-size: 12px;
    text-align: center;
    padding: 4px 0px;
    border: 1px solid black;
    min-width: 75px;
    width: 75px;
  }
}
</style>
