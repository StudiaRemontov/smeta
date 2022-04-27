<script>
export default {
  methods: {
    selectOutlay() {},
  },
}
</script>

<template>
  <div class="outlay-list">
    <div class="outlay-item" @click="selectOutlay">
      <span class="outlay-item__name"> Name 1 </span>
    </div>
    <div class="outlay-item">
      <span class="outlay-item__name"> Name 2 </span>
    </div>
    <div class="outlay-item">
      <span class="outlay-item__name"> Name 3 </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.outlay-list {
  display: flex;
  gap: 20px;
}

.outlay-item {
  border: 1px solid #a7a7a7;
  padding: 10px;
}
</style>
