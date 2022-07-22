<template>
  <main class="main">
    <slot name="header" />
    <slot name="body" />
  </main>
  <div id="print" class="print"></div>
</template>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-rows: 60px 1fr;
  gap: 10px;
  font-family: $outlay-font-family;
}

.print {
  display: none;
}

@media print {
  .main {
    display: none;
  }

  .print {
    display: block;
  }
}
</style>
