<script>
import TriangleIcon from '@/components/UI/Icons/TriangleIcon.vue'

import { formatNumber } from '@/helpers/formatNumber'
import { isObjectId } from '@/helpers/isObjectId'

export default {
  name: 'CategoryItem',
  components: { TriangleIcon },
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showChildren: false,
    }
  },
  computed: {
    sum() {
      return formatNumber(this.category.sum)
    },
    jobs() {
      const list = this.category.jobs.filter(j => {
        const { id } = j

        return isObjectId(id)
      })

      return list.map(j => ({
        ...j,
        sum: formatNumber(j.sum),
      }))
    },
  },
}
</script>

<template>
  <div class="category-item">
    <div class="category-item__head">
      <div class="category-item__text" @click="showChildren = !showChildren">
        <button
          class="button"
          :class="{ rotated: showChildren, hidden: jobs.length === 0 }"
        >
          <TriangleIcon class="button__icon" />
        </button>
        <span class="category-item__name" :title="category.name">
          {{ category.name }}
        </span>
      </div>
      <span class="category-item__price">
        {{ sum }}
      </span>
    </div>
    <div
      v-if="jobs && jobs.length > 0 && showChildren"
      class="category-item__list"
    >
      <div v-for="job in jobs" :key="job.key" class="category-item">
        <div class="category-item__head">
          <span class="category-item__name" :title="job.name">
            {{ job.name }}
          </span>
          <span class="category-item__price">
            {{ job.sum.toLocaleString() }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.category-item {
  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__text {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    overflow: hidden;
  }

  &__name {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__price {
    font-weight: 700;
  }

  &__list {
    margin-left: 20px;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.button {
  transition: transform 0.2s ease;

  &.rotated {
    transform: rotate(90deg);
  }

  &.hidden {
    opacity: 0;
  }
}
</style>
