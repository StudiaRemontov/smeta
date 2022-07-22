<script>
import BackIcon from '@/components/UI/Icons/ArrowRight.vue'
import SaveIcon from '@/components/UI/Icons/SaveIcon.vue'
import DownloadIcon from '@/components/UI/Icons/DownloadIcon.vue'
import DocumentIcon from '@/components/UI/Icons/DocumentIcon.vue'
import PrintIcon from '@/components/UI/Icons/PrintIcon.vue'
import ConfirmIcon from '@/components/UI/Icons/ConfirmIcon.vue'

import PrintPage from '@/components/Print/PrintPage.vue'
import OutlayBlock from '@/components/Layout/Outlay/OutlayBlock.vue'

export default {
  components: {
    BackIcon,
    SaveIcon,
    DownloadIcon,
    DocumentIcon,
    PrintIcon,
    ConfirmIcon,
    PrintPage,
    OutlayBlock,
  },
  props: {
    actions: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
}
</script>

<template>
  <OutlayBlock>
    <div class="action-list">
      <button
        v-for="action in actions"
        class="button action"
        :key="action.text"
        :disabled="action.disabled"
        @click="action.handler"
      >
        <component class="action__icon" :is="action.icon" />
        <span class="action__text">{{ action.text }}</span>
        <i v-if="action.loading" class="pi pi-spin pi-spinner"></i>
      </button>
    </div>
  </OutlayBlock>
</template>

<style lang="scss" scoped>
.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action {
  border: 1px solid #545454;
  border-radius: 10px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 15px;

  &__icon {
    width: 15px;
    height: 15px;
  }

  &:disabled &__icon {
    opacity: 0.5;
  }
}
</style>
