<script>
import { mapGetters } from 'vuex'
import OutlayBlock from '@/components/Layout/OutlayBlock.vue'
import RoomParameters from './ParameterList/RoomParameters.vue'
import TotalParameters from './ParameterList/TotalParameters.vue'

export default {
  components: {
    OutlayBlock,
    RoomParameters,
    TotalParameters,
  },
  computed: {
    ...mapGetters('acts', ['activeRoom', 'activeTab']),
  },
}
</script>

<template>
  <OutlayBlock>
    <div class="parameters">
      <RoomParameters
        v-if="activeTab === 'room' && activeRoom && activeRoom.options"
      />
      <TotalParameters v-else-if="!activeRoom" />
    </div>
  </OutlayBlock>
</template>

<style lang="scss" scoped>
.parameters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
