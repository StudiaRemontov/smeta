<script>
import { mapGetters } from 'vuex'
import TableView from './TableView.vue'

export default {
  components: {
    TableView,
  },
  props: {
    directory: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isChildrenVisible: false,
    }
  },
  computed: {
    ...mapGetters('edition', ['clonedDirectories']),
    children() {
      return this.clonedDirectories.filter(d => d.parent === this.directory._id)
    },
  },
  methods: {
    check(e) {
      const { checked } = e.target
      this.isChildrenVisible = checked
    },
  },
}
</script>

<template>
  <li class="directory-item">
    <div class="directory-item__body">
      <input type="checkbox" :id="directory._id" @change="check" />
      <button
        v-if="children.length > 0 || directory.data"
        @click="isChildrenVisible = !isChildrenVisible"
      >
        +
      </button>
      <label class="directory-item__name" :for="directory._id">
        {{ directory.name }}
      </label>
    </div>

    <DirectoryList
      v-if="children.length > 0 && isChildrenVisible"
      :directories="children"
    />
    <TableView
      v-else-if="directory.data && isChildrenVisible"
      class="directory-item__table"
      :data="directory.data"
    />
  </li>
</template>

<style lang="scss" scoped>
.directory-item {
  &__body {
    padding: 10px;
    border: 1px solid #a7a7a7;
    border-radius: 5px;
    display: flex;
    gap: 5px;
    align-items: center;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__name {
    user-select: none;
  }

  &__table {
    padding-left: 30px;
  }
}
</style>
