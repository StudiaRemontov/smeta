<script>
import RootItem from './RootItem.vue'

export default {
  components: {
    RootItem,
  },
  props: {
    directories: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template>
  <RootItem
    v-for="directory in directories"
    :key="directory._id"
    :directory="directory"
    :root="directory._id"
  />
</template>
